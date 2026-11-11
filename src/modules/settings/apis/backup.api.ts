import { z } from 'zod'
import { getDb } from '#/modules/database/apis/database.api'
import { notifyDbChange } from '#/modules/database/utils/live'
import { DB_VERSION } from '#/modules/database/utils/migrations'
import { DATA_STORES } from '#/modules/database/utils/database.schema'
import { installmentSchema, paymentSchema } from '#/modules/installments/utils/installments.schema'
import { plantSchema, wateringSchema } from '#/modules/plants/utils/plants.schema'
import { planSchema } from '#/modules/plans/utils/plans.schema'
import { reminderEventSchema, reminderSchema } from '#/modules/reminders/utils/reminders.schema'
import { settingsSchema, settingsStore, updateSettings } from '#/modules/settings/stores/settings.store'
import type { Backup, ParseResult } from '#/modules/settings/types'

const backupSchema = z.object({
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
    // default: backups made before plans existed
    plans: z.array(planSchema).default([]),
  }),
})

const exportData = async (): Promise<string> => {
  const db = await getDb()
  const tx = db.transaction([...DATA_STORES], 'readonly')
  const data = Object.fromEntries(
    await Promise.all(DATA_STORES.map(async (s) => [s, await tx.objectStore(s).getAll()] as const)),
  )
  return JSON.stringify(
    {
      app: 'life-reminder',
      schemaVersion: DB_VERSION,
      exportedAt: new Date().toISOString(),
      settings: settingsStore.state,
      data,
    },
    null,
    2,
  )
}

const parseBackup = (text: string): ParseResult => {
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

const importData = async (backup: Backup) => {
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
    ...d.plans.map((r) => tx.objectStore('plans').put(r)),
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

const downloadText = (text: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export { backupSchema, exportData, parseBackup, importData, downloadText }
