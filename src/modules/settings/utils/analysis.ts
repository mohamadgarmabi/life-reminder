import type { Agenda } from '#/modules/dashboard/types'
import { KIND } from '#/modules/dashboard/utils/dashboard.constants'
import type { Price, PriceId } from '#/modules/dashboard/utils/prices'
import type { Installment } from '#/modules/installments/types'
import { nextPayment, remainingPayments } from '#/modules/installments/utils/schedule'
import type { Plan } from '#/modules/plans/types'
import { planReport } from '#/modules/plans/utils/report'
import type { Plant } from '#/modules/plants/types'
import { nextWateringDate } from '#/modules/plants/utils/schedule'
import { formatDateLong, formatMoney, relativeDay } from '#/modules/shell/utils/format'

/** Keeps the prompt small; the model only needs the most relevant rows. */
const MAX_ROWS = 15

type AnalysisInput = {
  installments: Installment[]
  plants: Plant[]
  plans: Plan[]
  agenda: Agenda
  prices: Record<PriceId, Price | null> | null
  year: number
}

const section = (title: string, rows: string[], empty: string) =>
  [title, ...(rows.length ? rows.slice(0, MAX_ROWS).map((r) => `- ${r}`) : [`- ${empty}`])].join('\n')

const priceRow = (label: string, p: Price | null | undefined) =>
  p ? `${label}: ${formatMoney(p.price)} (تغییر روز ${p.changePercent}٪)` : `${label}: نامشخص`

/** Plain-text snapshot sent to the AI; it carries no ids, only what a human summary needs. */
const buildAnalysisSnapshot = ({ installments, plants, plans, agenda, prices, year }: AnalysisInput, now: Date) => {
  const active = installments.filter((i) => i.isActive && remainingPayments(i) > 0)
  const yearPlans = plans.filter((p) => p.year === year)
  const report = planReport(yearPlans)
  const reminders = [...agenda.overdue, ...agenda.today, ...agenda.upcoming].filter((i) => i.kind === 'reminder')
  return [
    `امروز: ${formatDateLong(now)}`,
    section(
      'اقساط:',
      active.map((i) => {
        const next = nextPayment(i)
        const due = next ? `، قسط بعدی ${relativeDay(next.dueDate, now)}` : ''
        return `${i.title}: ${formatMoney(i.amount, i.currency)}، ${remainingPayments(i)} از ${i.totalPayments} قسط مانده${due}`
      }),
      'قسط فعالی نیست',
    ),
    section('دلار و طلا:', [priceRow('دلار', prices?.dollar), priceRow('طلای ۱۸ عیار (گرم)', prices?.gold)], ''),
    section(
      `برنامه‌های سال ${year}: ${report.counts.done} از ${report.total} انجام شده (${report.percent}٪)`,
      yearPlans
        .filter((p) => p.status === 'in-progress' || p.status === 'planned')
        .map((p) => `${p.title} (${p.status === 'in-progress' ? 'در حال انجام' : 'شروع نشده'})`),
      'برنامهٔ باقی‌مانده‌ای نیست',
    ),
    section(
      'گیاهان:',
      plants.map((p) => `${p.name}: آبیاری ${relativeDay(nextWateringDate(p), now)}`),
      'گیاهی ثبت نشده',
    ),
    section(
      'یادآورها:',
      reminders.map((r) => `${r.title}: ${relativeDay(r.day, now)}`),
      'یادآوری برای این هفته نیست',
    ),
    section(
      'کارهای عقب‌افتاده:',
      agenda.overdue.map((i) => `${KIND[i.kind].label} «${i.title}»: ${relativeDay(i.day, now)}`),
      'هیچ',
    ),
  ].join('\n\n')
}

/** Most urgent dated item (overdue first, then today, then this week) and the page it lives on. */
const nearestItem = (agenda: Agenda, now: Date) => {
  const item = agenda.overdue[0] ?? agenda.today[0] ?? agenda.upcoming[0]
  if (!item) return null
  const { label, to } = KIND[item.kind]
  return { to, label: `${label} «${item.title}» · ${relativeDay(item.day, now)}` }
}

export { buildAnalysisSnapshot, nearestItem }
