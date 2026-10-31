import type { z } from 'zod'
import type {
  recurrenceSchema,
  reminderEventSchema,
  reminderFormSchema,
  reminderSchema,
} from '#/modules/reminders/utils/reminders.schema'

type Recurrence = z.infer<typeof recurrenceSchema>

type Reminder = z.infer<typeof reminderSchema>

type ReminderEvent = z.infer<typeof reminderEventSchema>

type ReminderFormValues = z.infer<typeof reminderFormSchema>

type ReminderCardProps = {
  reminder: Reminder
  now: Date
  onEdit: () => void
  onHistory: () => void
  onDelete: () => void
}

type ReminderFormProps = {
  initial?: Reminder
  onSubmit: (values: ReminderFormValues) => Promise<void>
}

type ReminderHistoryProps = { reminderId: string }

type RemindersDialog = { type: 'create' } | { type: 'edit' | 'history'; item: Reminder } | null

export type {
  Recurrence,
  Reminder,
  ReminderCardProps,
  ReminderEvent,
  ReminderFormProps,
  ReminderFormValues,
  ReminderHistoryProps,
  RemindersDialog,
}
