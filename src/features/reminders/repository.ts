import { abortTx, getDb, newId, validRecords } from '#/db/database'
import { notifyDbChange } from '#/db/live'
import { atTime, nowIso } from '#/lib/dates'
import {
  reminderEventSchema,
  reminderSchema,
  type Reminder,
  type ReminderEvent,
  type ReminderFormValues,
} from './schema'
import { completion, pendingOccurrence } from './schedule'

const fromForm = (v: ReminderFormValues) => ({
  title: v.title,
  description: v.description.trim() || null,
  scheduledAt: atTime(v.date, v.time).toISOString(),
  recurrence: v.recurrence,
})

export const reminderRepo = {
  async list(): Promise<Reminder[]> {
    const db = await getDb()
    return validRecords(reminderSchema, await db.getAll('reminders'), 'reminders')
  },

  async create(values: ReminderFormValues): Promise<Reminder> {
    const now = nowIso()
    const record = reminderSchema.parse({
      ...fromForm(values),
      id: newId(),
      isCompleted: false,
      completedThrough: null,
      snoozedUntil: null,
      createdAt: now,
      updatedAt: now,
    })
    await (await getDb()).add('reminders', record)
    notifyDbChange()
    return record
  },

  async update(id: string, values: ReminderFormValues): Promise<Reminder> {
    const db = await getDb()
    const tx = db.transaction('reminders', 'readwrite')
    const current = reminderSchema.parse(await tx.store.get(id))
    const next = fromForm(values)
    const rescheduled =
      next.scheduledAt !== current.scheduledAt || next.recurrence !== current.recurrence
    const record = reminderSchema.parse({
      ...current,
      ...next,
      // A new schedule starts fresh; history events are kept.
      ...(rescheduled && { isCompleted: false, completedThrough: null, snoozedUntil: null }),
      updatedAt: nowIso(),
    })
    await tx.store.put(record)
    await tx.done
    notifyDbChange()
    return record
  },

  async remove(id: string) {
    const db = await getDb()
    const tx = db.transaction(['reminders', 'reminderEvents'], 'readwrite')
    const events = tx.objectStore('reminderEvents')
    for (const key of await events.index('byReminder').getAllKeys(id)) await events.delete(key)
    await tx.objectStore('reminders').delete(id)
    await tx.done
    notifyDbChange()
  },

  async events(reminderId: string): Promise<ReminderEvent[]> {
    const db = await getDb()
    const rows = await db.getAllFromIndex('reminderEvents', 'byReminder', reminderId)
    return validRecords(reminderEventSchema, rows, 'reminderEvents').sort((a, b) => b.at.localeCompare(a.at))
  },

  /** Completes the pending occurrence the caller saw; a stale call (double tap) is a no-op. */
  async complete(id: string, expectedOccurrence: string, now: Date = new Date()): Promise<boolean> {
    const db = await getDb()
    const tx = db.transaction(['reminders', 'reminderEvents'], 'readwrite')
    const r = reminderSchema.parse(await tx.objectStore('reminders').get(id))
    const result = completion(r, now)
    if (!result || result.occurrence.toISOString() !== expectedOccurrence) {
      abortTx(tx)
      return false
    }
    await tx.objectStore('reminders').put({ ...r, ...result.patch, updatedAt: nowIso() })
    await tx.objectStore('reminderEvents').add({
      id: newId(),
      reminderId: id,
      type: 'completed',
      occurrenceAt: result.occurrence.toISOString(),
      at: now.toISOString(),
    })
    await tx.done
    notifyDbChange()
    return true
  },

  async snooze(id: string, until: Date, now: Date = new Date()) {
    const db = await getDb()
    const tx = db.transaction(['reminders', 'reminderEvents'], 'readwrite')
    const r = reminderSchema.parse(await tx.objectStore('reminders').get(id))
    const pending = pendingOccurrence(r)
    if (!pending) {
      abortTx(tx)
      return
    }
    await tx.objectStore('reminders').put({ ...r, snoozedUntil: until.toISOString(), updatedAt: nowIso() })
    await tx.objectStore('reminderEvents').add({
      id: newId(),
      reminderId: id,
      type: 'snoozed',
      occurrenceAt: pending.toISOString(),
      at: now.toISOString(),
    })
    await tx.done
    notifyDbChange()
  },
}
