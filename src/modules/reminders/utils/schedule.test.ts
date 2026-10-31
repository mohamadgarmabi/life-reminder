import { describe, expect, it } from 'vitest'
import { newDate } from 'date-fns-jalali'
import { formatDateTime } from '#/modules/shell/utils/format'
import type { Reminder } from '#/modules/reminders/types'
import { completion, dueAt, occurrence, pendingOccurrence } from '#/modules/reminders/utils/schedule'

const reminder = (over: Partial<Reminder>): Reminder => ({
  id: 'r1',
  title: 'دارو',
  description: null,
  scheduledAt: new Date(2026, 9, 1, 8, 0).toISOString(),
  recurrence: 'daily',
  isCompleted: false,
  completedThrough: null,
  snoozedUntil: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  ...over,
})

const apply = (r: Reminder, now: Date): Reminder => ({ ...r, ...completion(r, now)!.patch })

describe('one-time reminders', () => {
  it('completes once', () => {
    const r = reminder({ recurrence: 'none' })
    expect(pendingOccurrence(r)).toEqual(new Date(2026, 9, 1, 8, 0))
    const done = apply(r, new Date(2026, 9, 2))
    expect(done.isCompleted).toBe(true)
    expect(pendingOccurrence(done)).toBeNull()
    expect(completion(done, new Date())).toBeNull()
  })
})

describe('recurring reminders', () => {
  it('daily: completing an overdue reminder skips past occurrences', () => {
    const done = apply(reminder({}), new Date(2026, 9, 5, 9, 0))
    expect(new Date(done.completedThrough!)).toEqual(new Date(2026, 9, 5, 8, 0))
    expect(pendingOccurrence(done)).toEqual(new Date(2026, 9, 6, 8, 0))
    expect(done.isCompleted).toBe(false)
  })

  it('daily: completing early only completes the pending occurrence', () => {
    const done = apply(reminder({}), new Date(2026, 8, 30))
    expect(pendingOccurrence(done)).toEqual(new Date(2026, 9, 2, 8, 0))
  })

  it('weekly steps by 7 days', () => {
    const r = reminder({ recurrence: 'weekly' })
    expect(occurrence(r, 2)).toEqual(new Date(2026, 9, 15, 8, 0))
    const done = apply(r, new Date(2026, 9, 9))
    expect(pendingOccurrence(done)).toEqual(new Date(2026, 9, 15, 8, 0))
  })

  it('monthly follows Jalali months, clamped at month end without drift', () => {
    const r = reminder({ recurrence: 'monthly', scheduledAt: newDate(1405, 5, 31, 9, 0).toISOString() })
    expect(formatDateTime(occurrence(r, 1))).toBe('۱۴۰۵/۰۷/۳۰ ساعت ۰۹:۰۰')
    expect(formatDateTime(occurrence(r, 6))).toBe('۱۴۰۵/۱۲/۲۹ ساعت ۰۹:۰۰')
    expect(formatDateTime(occurrence(r, 7))).toBe('۱۴۰۶/۰۱/۳۱ ساعت ۰۹:۰۰')
    const done = apply(r, newDate(1405, 6, 2)) // 2 Mehr: completes 31 Shahrivar
    expect(formatDateTime(pendingOccurrence(done)!)).toBe('۱۴۰۵/۰۷/۳۰ ساعت ۰۹:۰۰')
  })

  it('handles long gaps efficiently', () => {
    const r = reminder({ scheduledAt: new Date(2020, 0, 1, 8).toISOString() })
    const done = apply(r, new Date(2026, 9, 31, 7))
    expect(pendingOccurrence(done)).toEqual(new Date(2026, 9, 31, 8, 0))
  })
})

describe('snooze', () => {
  it('overrides due time until completion', () => {
    const until = new Date(2026, 9, 1, 9, 0).toISOString()
    const r = reminder({ snoozedUntil: until })
    expect(dueAt(r)).toEqual(new Date(until))
    expect(apply(r, new Date(2026, 9, 1, 9, 5)).snoozedUntil).toBeNull()
  })
})
