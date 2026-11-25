import { addDays, addHours, addMinutes, addMonths } from 'date-fns'
import type { MessageKey } from '#/modules/shell/utils/i18n'
import type { Recurrence } from '#/modules/reminders/types'

// Message keys; translate with t() at render time.
const RECURRENCE_LABEL: Record<Recurrence, MessageKey> = {
  none: 'reminders.recurrence.none',
  daily: 'reminders.recurrence.daily',
  weekly: 'reminders.recurrence.weekly',
  monthly: 'reminders.recurrence.monthly',
}

const SNOOZE: { label: MessageKey; at: (now: Date) => Date }[] = [
  { label: 'reminders.snooze.15m', at: (now: Date) => addMinutes(now, 15) },
  { label: 'reminders.snooze.1h', at: (now: Date) => addHours(now, 1) },
  { label: 'reminders.snooze.tomorrow', at: (now: Date) => addDays(now, 1) },
  { label: 'reminders.snooze.3m', at: (now: Date) => addMonths(now, 3) },
]

export { RECURRENCE_LABEL, SNOOZE }
