import { addMonths, getDaysInMonth, setDate, startOfMonth } from 'date-fns-jalali'
import { daysBetween, parseIsoDate, toIsoDate } from '#/modules/shell/utils/dates'
import { type IsoDate } from '#/modules/shell/types'
import type { Installment } from '#/modules/installments/types'
import type { InstallmentStatus } from '#/modules/installments/types'

type Schedule = Pick<Installment, 'startDate' | 'dueDay'>

/** Due day inside the Jalali month containing `monthStart`, clamped to the month's length. */
const dueInMonth = (monthStart: Date, dueDay: number) =>
  setDate(monthStart, Math.min(dueDay, getDaysInMonth(monthStart)))

const paymentDueDate = (inst: Schedule, index: number): IsoDate => {
  const start = parseIsoDate(inst.startDate)
  const firstMonth = startOfMonth(start)
  const offset = dueInMonth(firstMonth, inst.dueDay) < start ? 1 : 0
  return toIsoDate(dueInMonth(addMonths(firstMonth, index + offset), inst.dueDay))
}

const remainingPayments = (inst: Installment) => Math.max(0, inst.totalPayments - inst.paidPayments)

const nextPayment = (inst: Installment): { index: number; dueDate: IsoDate } | null => {
  if (inst.paidPayments >= inst.totalPayments) return null
  return { index: inst.paidPayments, dueDate: paymentDueDate(inst, inst.paidPayments) }
}

const installmentStatus = (inst: Installment, today: IsoDate): InstallmentStatus => {
  const next = nextPayment(inst)
  if (!next) return 'done'
  if (!inst.isActive) return 'paused'
  const days = daysBetween(today, next.dueDate)
  if (days < 0) return 'overdue'
  if (days === 0) return 'today'
  return days <= Math.max(3, ...inst.reminderDaysBefore) ? 'soon' : 'upcoming'
}

export { paymentDueDate, remainingPayments, nextPayment, installmentStatus }
