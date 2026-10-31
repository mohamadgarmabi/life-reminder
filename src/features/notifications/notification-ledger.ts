import { getDb } from '#/db/database'

/**
 * Atomically claims keys that have never been notified. IndexedDB serialises readwrite
 * transactions on the same store, so two open tabs can't both claim (and show) the same key.
 */
export async function claimKeys(keys: string[], now: Date = new Date()): Promise<Set<string>> {
  const db = await getDb()
  const tx = db.transaction('notificationLedger', 'readwrite')
  const claimed = new Set<string>()
  for (const key of keys) {
    if (await tx.store.getKey(key)) continue
    await tx.store.put({ key, firedAt: now.toISOString() })
    claimed.add(key)
  }
  await tx.done
  return claimed
}

/** Drop ledger entries old enough that their keys can never be due again. */
export async function pruneLedger(olderThan: Date) {
  const db = await getDb()
  const tx = db.transaction('notificationLedger', 'readwrite')
  const range = IDBKeyRange.upperBound(olderThan.toISOString())
  for (const key of await tx.store.index('byFiredAt').getAllKeys(range)) await tx.store.delete(key)
  await tx.done
}
