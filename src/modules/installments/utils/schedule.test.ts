import { afterEach, describe, expect, it } from 'vitest'
import { newDate } from 'date-fns-jalali'
import { toIsoDate } from '#/modules/shell/utils/dates'
import { formatDate } from '#/modules/shell/utils/format'
import type { Installment } from '#/modules/installments/types'
import { installmentStatus, nextPayment, paymentDueDate } from '#/modules/installments/utils/schedule'

/** Jalali y/m/d (1-based month) → stored ISO date. */
const j = (y: number, m: number, d: number) => toIsoDate(newDate(y, m - 1, d))

const inst = (over: Partial<Installment>): Installment => ({
  id: 'i1',
  title: 'وام',
  amount: 1_000_000,
  currency: 'IRT',
  dueDay: 10,
  startDate: j(1405, 7, 15),
  totalPayments: 12,
  paidPayments: 0,
  reminderDaysBefore: [1],
  notes: null,
  isActive: true,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  ...over,
})

const due = (i: Installment, n: number) => formatDate(paymentDueDate(i, n))

describe('paymentDueDate', () => {
  it('starts at the first due day on or after the start date', () => {
    expect(due(inst({ dueDay: 10, startDate: j(1405, 7, 15) }), 0)).toBe('۱۴۰۵/۰۸/۱۰')
    expect(due(inst({ dueDay: 10, startDate: j(1405, 7, 15) }), 1)).toBe('۱۴۰۵/۰۹/۱۰')
    expect(due(inst({ dueDay: 15, startDate: j(1405, 7, 15) }), 0)).toBe('۱۴۰۵/۰۷/۱۵')
  })

  it('clamps day 31 to month end and recovers in long months (no drift)', () => {
    const i = inst({ dueDay: 31, startDate: j(1405, 6, 1) })
    expect(due(i, 0)).toBe('۱۴۰۵/۰۶/۳۱')
    expect(due(i, 1)).toBe('۱۴۰۵/۰۷/۳۰') // Mehr has 30 days
    expect(due(i, 6)).toBe('۱۴۰۵/۱۲/۲۹') // Esfand of a common year
    expect(due(i, 7)).toBe('۱۴۰۶/۰۱/۳۱') // back to 31
  })

  it('handles Esfand in a leap year', () => {
    expect(due(inst({ dueDay: 30, startDate: j(1403, 12, 1) }), 0)).toBe('۱۴۰۳/۱۲/۳۰')
    expect(due(inst({ dueDay: 30, startDate: j(1404, 12, 1) }), 0)).toBe('۱۴۰۴/۱۲/۲۹')
  })

  it('crosses the Jalali year boundary', () => {
    expect(due(inst({ dueDay: 5, startDate: j(1405, 11, 20) }), 1)).toBe('۱۴۰۶/۰۱/۰۵')
  })

  describe('timezone changes', () => {
    const original = process.env.TZ
    afterEach(() => {
      process.env.TZ = original
    })
    it('produces the same calendar dates in any zone', () => {
      const i = inst({ dueDay: 31, startDate: '2026-08-23' })
      const tehran = [0, 1, 6, 7].map((n) => paymentDueDate(i, n))
      process.env.TZ = 'America/Los_Angeles'
      expect([0, 1, 6, 7].map((n) => paymentDueDate(i, n))).toEqual(tehran)
    })
  })
})

describe('nextPayment / status', () => {
  it('returns null when fully paid', () => {
    expect(nextPayment(inst({ totalPayments: 3, paidPayments: 3 }))).toBeNull()
    expect(installmentStatus(inst({ totalPayments: 3, paidPayments: 3 }), j(1405, 8, 1))).toBe('done')
  })

  it('advances with paid payments', () => {
    expect(nextPayment(inst({ paidPayments: 2 }))).toEqual({ index: 2, dueDate: j(1405, 10, 10) })
  })

  it('classifies by days to next due date', () => {
    const i = inst({})
    expect(installmentStatus(i, j(1405, 8, 11))).toBe('overdue')
    expect(installmentStatus(i, j(1405, 8, 10))).toBe('today')
    expect(installmentStatus(i, j(1405, 8, 8))).toBe('soon')
    expect(installmentStatus(i, j(1405, 7, 20))).toBe('upcoming')
    expect(installmentStatus(inst({ isActive: false }), j(1405, 8, 11))).toBe('paused')
  })
})
