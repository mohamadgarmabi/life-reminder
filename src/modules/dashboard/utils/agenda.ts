import type { Installment } from '#/modules/installments/types'
import { nextPayment } from '#/modules/installments/utils/schedule'
import type { Plant } from '#/modules/plants/types'
import { nextWateringDate } from '#/modules/plants/utils/schedule'
import type { Reminder } from '#/modules/reminders/types'
import { dueAt } from '#/modules/reminders/utils/schedule'
import { addDaysIso, toIsoDate } from '#/modules/shell/utils/dates'
import type { AgendaItem, Agenda } from '#/modules/dashboard/types'

const buildAgenda = (
  data: { installments: Installment[]; plants: Plant[]; reminders: Reminder[] },
  now: Date,
  horizonDays = 7,
): Agenda => {
  const items: AgendaItem[] = []
  for (const inst of data.installments) {
    const next = inst.isActive ? nextPayment(inst) : null
    if (next)
      items.push({
        key: `i:${inst.id}`,
        kind: 'installment',
        title: inst.title,
        day: next.dueDate,
        at: null,
        installment: inst,
      })
  }
  for (const p of data.plants) {
    items.push({ key: `p:${p.id}`, kind: 'plant', title: p.name, day: nextWateringDate(p), at: null })
  }
  for (const r of data.reminders) {
    const at = dueAt(r)
    if (at) items.push({ key: `r:${r.id}`, kind: 'reminder', title: r.title, day: toIsoDate(at), at })
  }

  const today = toIsoDate(now)
  const horizon = addDaysIso(today, horizonDays)
  const sorted = items.sort((a, b) => a.day.localeCompare(b.day) || (a.at?.getTime() ?? 0) - (b.at?.getTime() ?? 0))
  // A reminder later today is "today"; one earlier today that's still pending is overdue.
  const isOverdue = (i: AgendaItem) => i.day < today || (i.at !== null && i.at < now)
  return {
    overdue: sorted.filter(isOverdue),
    today: sorted.filter((i) => !isOverdue(i) && i.day === today),
    upcoming: sorted.filter((i) => i.day > today && i.day <= horizon),
  }
}

export { buildAgenda }
