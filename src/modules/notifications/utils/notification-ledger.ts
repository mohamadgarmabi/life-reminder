import { getDb } from '#/modules/database/apis/database.api'

const claimKeys = async (keys: string[], now: Date = new Date()): Promise<Set<string>> => {
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

const pruneLedger = async (olderThan: Date) => {
  const db = await getDb()
  const tx = db.transaction('notificationLedger', 'readwrite')
  const range = IDBKeyRange.upperBound(olderThan.toISOString())
  for (const key of await tx.store.index('byFiredAt').getAllKeys(range)) await tx.store.delete(key)
  await tx.done
}

export { claimKeys, pruneLedger }
