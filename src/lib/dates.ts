import { addDays, differenceInCalendarDays } from 'date-fns'

/**
 * Storage formats:
 * - IsoDate  "YYYY-MM-DD": a Gregorian calendar date with no time/zone (due dates, watering days).
 *   Kept zone-free so a timezone change never shifts which day something is due.
 * - ISO datetime "...Z": an absolute instant (reminder times, createdAt, payment timestamps).
 */
export type IsoDate = string

const pad = (n: number) => String(n).padStart(2, '0')

export function toIsoDate(d: Date): IsoDate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Local midnight of the given calendar date. */
export function parseIsoDate(s: IsoDate): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayIso = (now: Date = new Date()): IsoDate => toIsoDate(now)

export const addDaysIso = (s: IsoDate, n: number): IsoDate =>
  toIsoDate(addDays(parseIsoDate(s), n))

/** Whole calendar days from `from` to `to` (positive when `to` is later). */
export const daysBetween = (from: IsoDate, to: IsoDate): number =>
  differenceInCalendarDays(parseIsoDate(to), parseIsoDate(from))

/** Combine a calendar date with an "HH:mm" local time into an instant. */
export function atTime(date: IsoDate, time: string): Date {
  const [h, m] = time.split(':').map(Number)
  const d = parseIsoDate(date)
  d.setHours(h, m, 0, 0)
  return d
}

export const nowIso = () => new Date().toISOString()
