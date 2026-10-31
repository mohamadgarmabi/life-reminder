import { openDB } from 'idb'
import type { z } from 'zod'
import { appStore } from '#/modules/shell/stores/shell.store'
import { DB_VERSION, runMigrations } from '#/modules/database/utils/migrations'
import { DB_NAME } from '#/modules/database/utils/database.schema'
import { type LifeDB } from '#/modules/database/types'
import type { Db } from '#/modules/database/types'

let dbPromise: Promise<Db> | null = null

const getDb = (): Promise<Db> => {
  if (dbPromise) return dbPromise
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('مرورگر شما از IndexedDB پشتیبانی نمی‌کند یا دسترسی به آن مسدود است.'))
  }
  const opening = openDB<LifeDB>(DB_NAME, DB_VERSION, {
    upgrade: (db, oldVersion, _newVersion, tx) => runMigrations(db, oldVersion, tx),
    blocked: () =>
      appStore.setState((s) => ({
        ...s,
        db: { state: 'error', message: 'برنامه در تب دیگری باز است. آن تب را ببندید تا پایگاه داده به‌روز شود.' },
      })),
    // A newer version opened in another tab: release our connection so its upgrade can proceed.
    blocking: () => {
      void opening.then((db) => db.close())
      dbPromise = null
    },
    terminated: () => {
      dbPromise = null
    },
  })
  dbPromise = opening
  // Let a later call retry instead of caching a failure forever.
  opening.catch(() => {
    if (dbPromise === opening) dbPromise = null
  })
  return opening
}

const resetDbForTests = async () => {
  if (dbPromise) (await dbPromise).close()
  dbPromise = null
}

const validRecords = <T>(schema: z.ZodType<T>, rows: unknown[], store: string): T[] => {
  const valid: T[] = []
  let invalid = 0
  for (const row of rows) {
    const parsed = schema.safeParse(row)
    if (parsed.success) valid.push(parsed.data)
    else invalid++
  }
  if (appStore.state.invalidRecords[store] !== invalid) {
    appStore.setState((s) => ({ ...s, invalidRecords: { ...s.invalidRecords, [store]: invalid } }))
  }
  return valid
}

const newId = () => crypto.randomUUID()

const abortTx = (tx: { done: Promise<void>; abort(): void }) => {
  tx.done.catch(() => {})
  tx.abort()
}

export { getDb, resetDbForTests, validRecords, newId, abortTx }
