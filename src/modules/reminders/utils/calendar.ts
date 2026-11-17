import * as gregorian from 'date-fns'
import * as jalali from 'date-fns-jalali'
import { formatLocal } from '#/modules/shell/utils/format'
import { getLanguage } from '#/modules/shell/utils/i18n'
import { parseIsoDate, toIsoDate } from '#/modules/shell/utils/dates'
import type { IsoDate } from '#/modules/shell/types'
import type { CalendarEvent, Reminder } from '#/modules/reminders/types'
import { occurrencesBetween } from '#/modules/reminders/utils/schedule'
import type { Occurrence } from '#/modules/reminders/utils/schedule'

type TimelineEntry =
  | { kind: 'reminder'; key: string; at: Date; allDay: false; reminder: Reminder; occurrence: Occurrence }
  | { kind: 'google'; key: string; at: Date; allDay: boolean; event: CalendarEvent }

const { addDays } = gregorian

/** Month grid follows the display calendar: Jalali in Persian, Gregorian in English. */
const cal = () => (getLanguage() === 'fa' ? jalali : gregorian)

/** Month around `day`: [start, end) as Dates plus every day in it. */
const monthOf = (day: IsoDate) => {
  const { startOfMonth, endOfMonth } = cal()
  const start = startOfMonth(parseIsoDate(day))
  const end = addDays(endOfMonth(start), 1)
  const days: IsoDate[] = []
  for (let d = start; d < end; d = addDays(d, 1)) days.push(toIsoDate(d))
  return { start, end, days, label: formatLocal(start, 'MMMM yyyy') }
}

/** First day of the month `delta` months away, or today when that month contains it. */
const shiftMonth = (day: IsoDate, delta: number, today: IsoDate): IsoDate => {
  const { addMonths, startOfMonth } = cal()
  const first = toIsoDate(addMonths(startOfMonth(parseIsoDate(day)), delta))
  return monthOf(first).days.includes(today) ? today : first
}

const dayLabels = (day: IsoDate) => ({ number: formatLocal(day, 'd'), weekday: formatLocal(day, 'EEEEEE') })

/** Local reminder occurrences and Google events in [start, end), grouped by day; all-day first, then by time. */
const timelineByDay = (reminders: Reminder[], events: CalendarEvent[], start: Date, end: Date) => {
  const byDay = new Map<IsoDate, TimelineEntry[]>()
  const push = (day: IsoDate, entry: TimelineEntry) => byDay.set(day, [...(byDay.get(day) ?? []), entry])

  for (const reminder of reminders)
    for (const occurrence of occurrencesBetween(reminder, start, end))
      push(toIsoDate(occurrence.at), {
        kind: 'reminder',
        key: `${reminder.id}:${occurrence.at.getTime()}`,
        at: occurrence.at,
        allDay: false,
        reminder,
        occurrence,
      })

  for (const event of events) {
    const entry = { kind: 'google' as const, key: event.id, at: event.start, allDay: event.allDay, event }
    if (!event.allDay) push(toIsoDate(event.start), entry)
    // A multi-day all-day event shows on each of its days (its end date is exclusive).
    else
      for (let d = event.start; d < event.end; d = addDays(d, 1))
        if (d >= start && d < end) push(toIsoDate(d), { ...entry, key: `${event.id}:${toIsoDate(d)}` })
  }

  for (const entries of byDay.values())
    entries.sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.at.getTime() - b.at.getTime())
  return byDay
}

export { monthOf, shiftMonth, dayLabels, timelineByDay }
export type { TimelineEntry }
