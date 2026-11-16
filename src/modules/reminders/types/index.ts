import type { LucideIcon } from 'lucide-react'
import type { z } from 'zod'
import type { ActionSheetGroup } from '#/modules/shell/components/action-sheet'
import type { SwipeAction } from '#/modules/shell/types/swipe-row'
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

type ReminderFormProps = {
  initial?: Reminder
  onSubmit: (values: ReminderFormValues) => Promise<void>
}

type ReminderHistoryProps = { reminderId: string }

type RemindersDialog = { type: 'create' } | { type: 'edit' | 'history'; item: Reminder } | null

/** One instance of a Google Calendar event (recurrences are expanded by Google). */
type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
}

type TimelineCardProps = {
  title: string
  subtitle: string
  badge: string
  badgeClassName: string
  cardClassName: string
  titleClassName: string
  Icon: LucideIcon
  menu: ActionSheetGroup[] | null
  menuAriaLabel: string
  /** Swipe actions; null = not swipeable (Google events are read-only). */
  swipe: SwipeAction[] | null
}

export type {
  CalendarEvent,
  TimelineCardProps,
  Recurrence,
  Reminder,
  ReminderEvent,
  ReminderFormProps,
  ReminderFormValues,
  ReminderHistoryProps,
  RemindersDialog,
}
