import { openDB, type IDBPDatabase } from 'idb'
import type { z } from 'zod'
import { appStore } from '#/stores/app.store'
import { DB_VERSION, runMigrations } from './migrations'
import { DB_NAME, type LifeDB } from './schema'

export type Db = IDBPDatabase<LifeDB>

let dbPromise: Promise<Db> | null = null

export function getDb(): Promise<Db> {
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

/** Test-only: forget the cached connection. */
export async function resetDbForTests() {
  if (dbPromise) (await dbPromise).close()
  dbPromise = null
}

/**
 * Parse stored records, keeping invalid ones in the database (never discard) but out of the UI.
 * The count is surfaced on the settings page; export still includes the raw records.
 */
export function validRecords<T>(schema: z.ZodType<T>, rows: unknown[], store: string): T[] {
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

export const newId = () => crypto.randomUUID()

/** Abort without leaving `tx.done` as an unhandled rejection. */
export function abortTx(tx: { done: Promise<void>; abort(): void }) {
  tx.done.catch(() => {})
  tx.abort()
}
