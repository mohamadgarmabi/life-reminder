import { addDays, addWeeks, differenceInCalendarDays } from 'date-fns'
import { addMonths, differenceInCalendarMonths } from 'date-fns-jalali'
import type { Reminder } from './schema'

type Schedule = Pick<Reminder, 'scheduledAt' | 'recurrence'>

/** n-th occurrence (0-based). Monthly steps are Jalali months, clamped at month end, from the anchor. */
export function occurrence(r: Schedule, n: number): Date {
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

/** Index of the first occurrence strictly after `after`. */
function indexAfter(r: Schedule, after: Date): number {
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

/** The occurrence currently waiting to be completed, or null if nothing is pending. */
export function pendingOccurrence(r: Reminder): Date | null {
  if (r.isCompleted) return null
  if (!r.completedThrough) return new Date(r.scheduledAt)
  if (r.recurrence === 'none') return null
  return occurrence(r, indexAfter(r, new Date(r.completedThrough)))
}

/** When the reminder should next surface, taking snooze into account. */
export function dueAt(r: Reminder): Date | null {
  const pending = pendingOccurrence(r)
  if (!pending) return null
  return r.snoozedUntil ? new Date(r.snoozedUntil) : pending
}

/**
 * Completing an overdue recurring reminder also skips every occurrence already in the past,
 * so a daily reminder ignored for a week doesn't need seven taps.
 */
export function completion(r: Reminder, now: Date) {
  const pending = pendingOccurrence(r)
  if (!pending) return null
  const through =
    r.recurrence === 'none' || pending > now ? pending : occurrence(r, indexAfter(r, now) - 1)
  return {
    occurrence: pending,
    patch: {
      isCompleted: r.recurrence === 'none',
      completedThrough: through.toISOString(),
      snoozedUntil: null,
    } satisfies Partial<Reminder>,
  }
}
