import type { Agenda, AgendaItem } from '#/modules/dashboard/types'
import { KIND } from '#/modules/dashboard/utils/dashboard.constants'
import { formatPrice, PRICE_LABELS, type Price, type PriceId } from '#/modules/dashboard/utils/prices'
import type { Installment } from '#/modules/installments/types'
import { nextPayment, remainingPayments } from '#/modules/installments/utils/schedule'
import type { Plan } from '#/modules/plans/types'
import { planReport } from '#/modules/plans/utils/report'
import type { Plant } from '#/modules/plants/types'
import { nextWateringDate } from '#/modules/plants/utils/schedule'
import { formatDateLong, formatJalaliYear, formatMoney, relativeDay } from '#/modules/shell/utils/format'
import { t, type MessageKey } from '#/modules/shell/utils/i18n'

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

const priceRow = (label: MessageKey, p: Price | null | undefined) =>
  p
    ? t('settings.snapshot.priceRow', {
        label: t(label),
        price: t('settings.snapshot.priceValue', { price: formatPrice(p.price) }),
        percent: p.changePercent,
      })
    : t('settings.snapshot.priceUnknown', { label: t(label) })

const kindItem = (item: AgendaItem) =>
  t('settings.snapshot.kindItem', { kind: KIND[item.kind].label, title: item.title })

/** Plain-text snapshot sent to the AI; it carries no ids, only what a human summary needs. */
const buildAnalysisSnapshot = ({ installments, plants, plans, agenda, prices, year }: AnalysisInput, now: Date) => {
  const active = installments.filter((i) => i.isActive && remainingPayments(i) > 0)
  const yearPlans = plans.filter((p) => p.year === year)
  const report = planReport(yearPlans)
  const reminders = [...agenda.overdue, ...agenda.today, ...agenda.upcoming].filter((i) => i.kind === 'reminder')
  return [
    // The worker's prompt asks for Persian; this line switches the reply to the app language.
    t('settings.snapshot.answerLanguage'),
    t('settings.snapshot.today', { date: formatDateLong(now) }),
    section(
      t('settings.snapshot.installments'),
      active.map((i) => {
        const next = nextPayment(i)
        const due = next ? t('settings.snapshot.nextDue', { when: relativeDay(next.dueDate, now) }) : ''
        return t('settings.snapshot.installmentRow', {
          title: i.title,
          amount: formatMoney(i.amount, i.currency),
          remaining: remainingPayments(i),
          total: i.totalPayments,
          due,
        })
      }),
      t('settings.snapshot.noInstallments'),
    ),
    section(
      t('settings.snapshot.prices'),
      [priceRow(PRICE_LABELS.dollar.short, prices?.dollar), priceRow(PRICE_LABELS.gold.title, prices?.gold)],
      '',
    ),
    section(
      t('settings.snapshot.plans', {
        year: formatJalaliYear(year),
        done: report.counts.done,
        total: report.total,
        percent: report.percent,
      }),
      yearPlans
        .filter((p) => p.status === 'in-progress' || p.status === 'planned')
        .map(
          (p) =>
            `${p.title} (${t(p.status === 'in-progress' ? 'settings.snapshot.inProgress' : 'settings.snapshot.notStarted')})`,
        ),
      t('settings.snapshot.noPlans'),
    ),
    section(
      t('settings.snapshot.plants'),
      plants.map((p) => t('settings.snapshot.watering', { name: p.name, when: relativeDay(nextWateringDate(p), now) })),
      t('settings.snapshot.noPlants'),
    ),
    section(
      t('settings.snapshot.reminders'),
      reminders.map((r) => `${r.title}: ${relativeDay(r.day, now)}`),
      t('settings.snapshot.noReminders'),
    ),
    section(
      t('settings.snapshot.overdue'),
      agenda.overdue.map((i) => `${kindItem(i)}: ${relativeDay(i.day, now)}`),
      t('settings.snapshot.none'),
    ),
  ].join('\n\n')
}

/** Most urgent dated item (overdue first, then today, then this week) and the page it lives on. */
const nearestItem = (agenda: Agenda, now: Date) => {
  const item = agenda.overdue[0] ?? agenda.today[0] ?? agenda.upcoming[0]
  if (!item) return null
  return { to: KIND[item.kind].to, label: `${kindItem(item)} · ${relativeDay(item.day, now)}` }
}

export { buildAnalysisSnapshot, nearestItem }
