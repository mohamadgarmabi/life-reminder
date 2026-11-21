import { isGoogleSignInAvailable } from '#/modules/account/apis/google-account.api'
import { pullChanges, pushChanges } from '#/modules/account/apis/sync.api'
import type { SyncChange } from '#/modules/account/types'
import { getDb } from '#/modules/database/apis/database.api'
import { DATA_STORES } from '#/modules/database/utils/database.schema'
import { notifyDbChange, subscribeDbChange } from '#/modules/database/utils/live'
import { settingsStore } from '#/modules/settings/stores/settings.store'

// The account (push-worker/src/data.ts) is the source of truth; IndexedDB is this device's copy of it.
// Every sync: push what changed here since the last sync, then pull what changed on the account.

const META_KEY = 'life-reminder:sync'
/** Keeps each push request far below the Worker's body limit (plant photos are the big records). */
const MAX_PUSH_BYTES = 4_000_000
const MAX_PUSH_ITEMS = 200

type Meta = { familyId: string; cursor: number }
type Change = SyncChange & { key: string; hash: string | null }

const loadMeta = (): Meta | null => {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) ?? 'null') as Meta | null
  } catch {
    return null
  }
}

const saveMeta = (meta: Meta | null) => {
  try {
    if (meta) localStorage.setItem(META_KEY, JSON.stringify(meta))
    else localStorage.removeItem(META_KEY)
  } catch {
    // Without it the next sync re-downloads everything, which is safe.
  }
}

/** cyrb53: fast non-cryptographic hash, only used to notice that a record changed. */
const hash = (s: string) => {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 2654435761)
    h2 = Math.imul(h2 ^ c, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

const keyOf = (store: string, id: string) => `${store}:${id}`

/** Local records whose content differs from what was last synced, plus deletions of synced ones. */
const diffChanges = (
  local: { store: SyncChange['store']; id: string; data: string }[],
  synced: Map<string, string>,
): Change[] => {
  const changes: Change[] = []
  const seen = new Set<string>()
  for (const r of local) {
    const key = keyOf(r.store, r.id)
    const h = hash(r.data)
    seen.add(key)
    if (synced.get(key) !== h) changes.push({ ...r, key, hash: h })
  }
  for (const key of synced.keys()) {
    if (seen.has(key)) continue
    const at = key.indexOf(':')
    const store = key.slice(0, at) as SyncChange['store']
    if (DATA_STORES.includes(store)) changes.push({ store, id: key.slice(at + 1), data: null, key, hash: null })
  }
  return changes
}

/** Splits changes into requests that stay under the size and count limits. */
const chunk = (changes: Change[]) => {
  const out: Change[][] = []
  let bytes = 0
  for (const c of changes) {
    const size = c.data?.length ?? 0
    const last = out.at(-1)
    if (!last || last.length >= MAX_PUSH_ITEMS || bytes + size > MAX_PUSH_BYTES) {
      out.push([c])
      bytes = size
    } else {
      last.push(c)
      bytes += size
    }
  }
  return out
}

const readLocal = async () => {
  const db = await getDb()
  const tx = db.transaction([...DATA_STORES, 'syncState'], 'readonly')
  const local = (
    await Promise.all(
      DATA_STORES.map(async (store) =>
        (await tx.objectStore(store).getAll()).map((r) => ({ store, id: r.id, data: JSON.stringify(r) })),
      ),
    )
  ).flat()
  const synced = new Map((await tx.objectStore('syncState').getAll()).map((s) => [s.key, s.hash]))
  await tx.done
  return { local, synced }
}

const markSynced = async (changes: Change[]) => {
  const db = await getDb()
  const tx = db.transaction('syncState', 'readwrite')
  for (const c of changes) {
    if (c.hash) await tx.store.put({ key: c.key, hash: c.hash })
    else await tx.store.delete(c.key)
  }
  await tx.done
}

/** Writes account records into this device's copy; `replace` first empties it (another family's data). */
const applyRemote = async (records: SyncChange[], replace: boolean) => {
  const db = await getDb()
  const tx = db.transaction([...DATA_STORES, 'syncState'], 'readwrite')
  if (replace) await Promise.all([...DATA_STORES, 'syncState' as const].map((s) => tx.objectStore(s).clear()))
  for (const r of records) {
    const key = keyOf(r.store, r.id)
    if (r.data === null) {
      await tx.objectStore(r.store).delete(r.id)
      await tx.objectStore('syncState').delete(key)
    } else {
      await tx.objectStore(r.store).put(JSON.parse(r.data))
      await tx.objectStore('syncState').put({ key, hash: hash(r.data) })
    }
  }
  await tx.done
}

/** The session to sync with, or null when not signed in (or sign-in isn't configured). */
const activeSession = () => {
  const { googleSession, welcomeSeen } = settingsStore.state
  return isGoogleSignInAvailable && welcomeSeen ? googleSession : null
}

const syncOnce = async () => {
  const session = activeSession()
  if (!session) return
  const { local, synced } = await readLocal()
  for (const part of chunk(diffChanges(local, synced))) {
    await pushChanges(
      session,
      part.map(({ store, id, data }) => ({ store, id, data })),
    )
    await markSynced(part)
  }

  const meta = loadMeta()
  let pulled = await pullChanges(session, meta?.cursor ?? 0)
  // Another family (joined, left, or first sync): this device's copy is rebuilt from the account.
  const replace = pulled.familyId !== meta?.familyId
  if (replace && meta?.cursor) pulled = await pullChanges(session, 0)
  if (replace || pulled.records.length) {
    await applyRemote(pulled.records, replace)
    notifyDbChange()
  }
  saveMeta({ familyId: pulled.familyId, cursor: pulled.cursor })
}

let running: Promise<void> | null = null
let again = false

/** One sync at a time; a request during a sync runs once more right after it. Rejects if it fails. */
const syncNow = (): Promise<void> => {
  if (running) {
    again = true
    return running
  }
  running = (async () => {
    do {
      again = false
      await syncOnce()
    } while (again)
  })().finally(() => {
    running = null
  })
  return running
}

/**
 * Pushes anything unsynced, then removes the account's data from this device. Throws if the push fails,
 * unless `skipUpload` (the sign-in is no longer valid, so nothing can be uploaded anyway).
 */
const signOutDevice = async (skipUpload = false) => {
  if (!skipUpload) await syncNow()
  const db = await getDb()
  const stores = [...DATA_STORES, 'syncState', 'notificationHistory', 'notificationLedger'] as const
  const tx = db.transaction([...stores], 'readwrite')
  await Promise.all(stores.map((s) => tx.objectStore(s).clear()))
  await tx.done
  saveMeta(null)
  notifyDbChange()
}

const SYNC_INTERVAL_MS = 60_000

const startSyncEngine = () => {
  const run = () => void syncNow().catch((e: unknown) => console.error('sync failed', e))
  let timer: ReturnType<typeof setTimeout> | undefined
  // Debounced: a burst of edits is uploaded once.
  const soon = () => {
    clearTimeout(timer)
    timer = setTimeout(run, 1500)
  }
  const onVisible = () => {
    if (document.visibilityState === 'visible') run()
  }

  run()
  const interval = setInterval(run, SYNC_INTERVAL_MS)
  const unsubscribe = subscribeDbChange(soon)
  const settingsSub = settingsStore.subscribe(soon)
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    clearTimeout(timer)
    clearInterval(interval)
    unsubscribe()
    settingsSub.unsubscribe()
    document.removeEventListener('visibilitychange', onVisible)
  }
}

export { diffChanges, chunk, syncNow, signOutDevice, startSyncEngine }
