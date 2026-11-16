import { addDays, addWeeks, differenceInCalendarDays } from 'date-fns'
import { addMonths, differenceInCalendarMonths } from 'date-fns-jalali'
import type { Reminder } from '#/modules/reminders/types'

type Schedule = Pick<Reminder, 'scheduledAt' | 'recurrence'>

const occurrence = (r: Schedule, n: number): Date => {
  const start = new Date(r.scheduledAt)
  switch (r.recurrence) {
    case 'none':
      return start
    case 'daily':
      return addDays(start, n)
    case 'weekly':
      return addWeeks(start, n)
    case 'monthly':
      return addMonths(start, n)
  }
}

const indexAfter = (r: Schedule, after: Date): number => {
  const start = new Date(r.scheduledAt)
  if (after < start) return 0
  if (r.recurrence === 'none') return 1
  const approx =
    r.recurrence === 'monthly'
      ? differenceInCalendarMonths(after, start)
      : Math.floor(differenceInCalendarDays(after, start) / (r.recurrence === 'weekly' ? 7 : 1))
  let n = Math.max(0, approx - 1)
  while (occurrence(r, n) <= after) n++
  return n
}

const pendingOccurrence = (r: Reminder): Date | null => {
  if (r.isCompleted) return null
  if (!r.completedThrough) return new Date(r.scheduledAt)
  if (r.recurrence === 'none') return null
  return occurrence(r, indexAfter(r, new Date(r.completedThrough)))
}

const dueAt = (r: Reminder): Date | null => {
  const pending = pendingOccurrence(r)
  if (!pending) return null
  return r.snoozedUntil ? new Date(r.snoozedUntil) : pending
}

const completion = (r: Reminder, now: Date) => {
  const pending = pendingOccurrence(r)
  if (!pending) return null
  const through = r.recurrence === 'none' || pending > now ? pending : occurrence(r, indexAfter(r, now) - 1)
  return {
    occurrence: pending,
    patch: {
      isCompleted: r.recurrence === 'none',
      completedThrough: through.toISOString(),
      snoozedUntil: null,
    } satisfies Partial<Reminder>,
  }
}

type Occurrence = {
  at: Date
  /** The one occurrence actions (done, snooze) apply to; shown at its snoozed time. */
  isPending: boolean
  isDone: boolean
}

/** Every occurrence in [from, to), with the pending one moved to its snoozed time. */
const occurrencesBetween = (r: Reminder, from: Date, to: Date): Occurrence[] => {
  const pending = pendingOccurrence(r)
  const due = dueAt(r)
  const out: Occurrence[] = []
  const first = r.recurrence === 'none' ? 0 : indexAfter(r, new Date(from.getTime() - 1))
  for (let n = first; r.recurrence !== 'none' || n === 0; n++) {
    const at = occurrence(r, n)
    if (at >= to) break
    if (at < from || (pending && at.getTime() === pending.getTime())) continue
    out.push({ at, isPending: false, isDone: !pending || at < pending })
  }
  if (due && due >= from && due < to) out.push({ at: due, isPending: true, isDone: false })
  return out
}

export { occurrence, pendingOccurrence, dueAt, completion, occurrencesBetween }
export type { Occurrence }
