import { addDays, addHours, addMinutes } from 'date-fns'
import type { Recurrence } from '#/modules/reminders/types'

const RECURRENCE_LABEL: Record<Recurrence, string> = {
  none: 'یک‌بار',
  daily: 'هر روز',
  weekly: 'هر هفته',
  monthly: 'هر ماه',
}

const RECURRENCE_OPTIONS = (Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((value) => ({
  value,
  label: RECURRENCE_LABEL[value],
}))

const SNOOZE = [
  { label: '۱۵ دقیقه', at: (now: Date) => addMinutes(now, 15) },
  { label: '۱ ساعت', at: (now: Date) => addHours(now, 1) },
  { label: 'فردا همین ساعت', at: (now: Date) => addDays(now, 1) },
]

export { RECURRENCE_LABEL, RECURRENCE_OPTIONS, SNOOZE }
