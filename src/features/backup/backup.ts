import { z } from 'zod'
import { getDb } from '#/db/database'
import { notifyDbChange } from '#/db/live'
import { DB_VERSION } from '#/db/migrations'
import { DATA_STORES } from '#/db/schema'
import { installmentSchema, paymentSchema } from '#/features/installments/schema'
import { plantSchema, wateringSchema } from '#/features/plants/schema'
import { reminderEventSchema, reminderSchema } from '#/features/reminders/schema'
import { settingsSchema, settingsStore, updateSettings } from '#/stores/settings.store'

export const backupSchema = z.object({
  app: z.literal('life-reminder'),
  schemaVersion: z.number().int().min(1).max(DB_VERSION),
  exportedAt: z.string(),
  settings: settingsSchema.partial().optional(),
  data: z.object({
    installments: z.array(installmentSchema),
    payments: z.array(paymentSchema),
    plants: z.array(plantSchema),
    waterings: z.array(wateringSchema),
    reminders: z.array(reminderSchema),
    reminderEvents: z.array(reminderEventSchema),
  }),
})
export type Backup = z.infer<typeof backupSchema>

/** Raw dump of every store, including records that fail validation, so nothing is lost. */
export async function exportData(): Promise<string> {
  const db = await getDb()
  const tx = db.transaction([...DATA_STORES], 'readonly')
  const data = Object.fromEntries(
    await Promise.all(DATA_STORES.map(async (s) => [s, await tx.objectStore(s).getAll()] as const)),
  )
  return JSON.stringify(
    { app: 'life-reminder', schemaVersion: DB_VERSION, exportedAt: new Date().toISOString(), settings: settingsStore.state, data },
    null,
    2,
  )
}

export type ParseResult = { ok: true; backup: Backup } | { ok: false; error: string }

export function parseBackup(text: string): ParseResult {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, error: 'فایل JSON معتبر نیست.' }
  }
  const parsed = backupSchema.safeParse(json)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { ok: false, error: `ساختار فایل پشتیبان نامعتبر است (${issue.path.join('.') || 'root'}).` }
  }
  return { ok: true, backup: parsed.data }
}

/** Replaces all data in one transaction: either everything is imported or nothing changes. */
export async function importData(backup: Backup) {
  const db = await getDb()
  const tx = db.transaction([...DATA_STORES], 'readwrite')
  const d = backup.data
  // Issue clears before puts (IndexedDB runs requests in order); any failure aborts everything.
  const writes = [
    ...DATA_STORES.map((s) => tx.objectStore(s).clear()),
    ...d.installments.map((r) => tx.objectStore('installments').put(r)),
    ...d.payments.map((r) => tx.objectStore('payments').put(r)),
    ...d.plants.map((r) => tx.objectStore('plants').put(r)),
    ...d.waterings.map((r) => tx.objectStore('waterings').put(r)),
    ...d.reminders.map((r) => tx.objectStore('reminders').put(r)),
    ...d.reminderEvents.map((r) => tx.objectStore('reminderEvents').put(r)),
  ]
  try {
    await Promise.all(writes)
  } catch (e) {
    await tx.done.catch(() => {})
    throw e
  }
  await tx.done
  if (backup.settings) updateSettings(backup.settings)
  notifyDbChange()
}

export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
