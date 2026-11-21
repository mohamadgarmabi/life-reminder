import { getDb, newId } from '#/modules/database/apis/database.api'
import type { NotificationHistoryEntry } from '#/modules/database/types'
import { notifyDbChange } from '#/modules/database/utils/live'

const addHistory = async (entry: Omit<NotificationHistoryEntry, 'id' | 'at'>, at: Date = new Date()) => {
  const db = await getDb()
  await db.put('notificationHistory', { ...entry, id: newId(), at: at.toISOString() })
  notifyDbChange()
}

/** Newest first. */
const listHistory = async (): Promise<NotificationHistoryEntry[]> => {
  const db = await getDb()
  return (await db.getAllFromIndex('notificationHistory', 'byAt')).reverse()
}

export { addHistory, listHistory }
