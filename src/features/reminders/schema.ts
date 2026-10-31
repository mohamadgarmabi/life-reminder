import { z } from 'zod'
import { id, isoDate, isoDateTime } from '#/lib/zod'

export const recurrenceSchema = z.enum(['none', 'daily', 'weekly', 'monthly'])
export type Recurrence = z.infer<typeof recurrenceSchema>

export const reminderSchema = z.object({
  id,
  title: z.string().trim().min(1).max(100),
  description: z.string().max(2000).nullable(),
  /** First occurrence; recurring occurrences are derived from it so monthly dates never drift. */
  scheduledAt: isoDateTime,
  recurrence: recurrenceSchema,
  isCompleted: z.boolean(),
  /** Latest occurrence the user has completed (recurring reminders). */
  completedThrough: isoDateTime.nullable(),
  /** Pushes the current pending occurrence later without moving the schedule. */
  snoozedUntil: isoDateTime.nullable(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
})
export type Reminder = z.infer<typeof reminderSchema>

export const reminderEventSchema = z.object({
  id,
  reminderId: id,
  type: z.enum(['completed', 'snoozed']),
  occurrenceAt: isoDateTime,
  at: isoDateTime,
})
export type ReminderEvent = z.infer<typeof reminderEventSchema>

export const reminderFormSchema = z.object({
  title: z.string().trim().min(1, 'عنوان را وارد کنید').max(100, 'عنوان طولانی است'),
  description: z.string().max(2000),
  date: isoDate,
  time: z.string().regex(/^\d{2}:\d{2}$/),
  recurrence: recurrenceSchema,
})
export type ReminderFormValues = z.infer<typeof reminderFormSchema>
