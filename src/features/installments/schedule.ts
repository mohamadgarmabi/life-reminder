import { addMonths, getDaysInMonth, setDate, startOfMonth } from 'date-fns-jalali'
import { daysBetween, parseIsoDate, toIsoDate, type IsoDate } from '#/lib/dates'
import type { Installment } from './schema'

type Schedule = Pick<Installment, 'startDate' | 'dueDay'>

/** Due day inside the Jalali month containing `monthStart`, clamped to the month's length. */
const dueInMonth = (monthStart: Date, dueDay: number) =>
  setDate(monthStart, Math.min(dueDay, getDaysInMonth(monthStart)))

/**
 * Due date of payment `index` (0-based). The first payment is the first `dueDay` on or after
 * `startDate`; each later one is one Jalali month after it, always computed from the start month
 * so a short month (e.g. Esfand) never shifts subsequent due days.
 */
export function paymentDueDate(inst: Schedule, index: number): IsoDate {
  const start = parseIsoDate(inst.startDate)
  const firstMonth = startOfMonth(start)
  const offset = dueInMonth(firstMonth, inst.dueDay) < start ? 1 : 0
  return toIsoDate(dueInMonth(addMonths(firstMonth, index + offset), inst.dueDay))
}

export const remainingPayments = (inst: Installment) =>
  Math.max(0, inst.totalPayments - inst.paidPayments)

export function nextPayment(inst: Installment): { index: number; dueDate: IsoDate } | null {
  if (inst.paidPayments >= inst.totalPayments) return null
  return { index: inst.paidPayments, dueDate: paymentDueDate(inst, inst.paidPayments) }
}

export type InstallmentStatus = 'done' | 'paused' | 'overdue' | 'today' | 'soon' | 'upcoming'

export function installmentStatus(inst: Installment, today: IsoDate): InstallmentStatus {
  const next = nextPayment(inst)
  if (!next) return 'done'
  if (!inst.isActive) return 'paused'
  const days = daysBetween(today, next.dueDate)
  if (days < 0) return 'overdue'
  if (days === 0) return 'today'
  return days <= Math.max(3, ...inst.reminderDaysBefore) ? 'soon' : 'upcoming'
}
