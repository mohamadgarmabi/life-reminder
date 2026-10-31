import { addDays, differenceInCalendarDays } from 'date-fns'
import type { IsoDate } from '#/modules/shell/types'

const pad = (n: number) => String(n).padStart(2, '0')

const toIsoDate = (d: Date): IsoDate => {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const parseIsoDate = (s: IsoDate): Date => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const todayIso = (now: Date = new Date()): IsoDate => toIsoDate(now)

const addDaysIso = (s: IsoDate, n: number): IsoDate => toIsoDate(addDays(parseIsoDate(s), n))

/** Whole calendar days from `from` to `to` (positive when `to` is later). */
const daysBetween = (from: IsoDate, to: IsoDate): number =>
  differenceInCalendarDays(parseIsoDate(to), parseIsoDate(from))

const atTime = (date: IsoDate, time: string): Date => {
  const [h, m] = time.split(':').map(Number)
  const d = parseIsoDate(date)
  d.setHours(h, m, 0, 0)
  return d
}

const nowIso = () => new Date().toISOString()

export { toIsoDate, parseIsoDate, todayIso, addDaysIso, daysBetween, atTime, nowIso }
