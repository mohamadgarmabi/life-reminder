import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { buildAgenda } from '#/modules/dashboard/utils/agenda'
import { QUICK_ACTIONS } from '#/modules/dashboard/utils/dashboard.constants'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import { reminderRepo } from '#/modules/reminders/apis/reminders.api'
import { formatDateLong } from '#/modules/shell/utils/format'
import { useNow } from '#/modules/shell/hooks/now.hook'

const useDashboard = () => {
  const now = useNow()
  const q = useLiveQuery(async () => {
    const [installments, plants, reminders] = await Promise.all([
      installmentRepo.list(),
      plantRepo.list(),
      reminderRepo.list(),
    ])
    return { installments, plants, reminders }
  })
  const agenda = q.data ? buildAgenda(q.data, now) : null

  return {
    now,
    dateLabel: formatDateLong(now),
    quickActions: QUICK_ACTIONS,
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : null,
    agenda,
    hasOverdue: !!agenda && agenda.overdue.length > 0,
    overdueTone: agenda?.overdue.length ? ('danger' as const) : undefined,
  }
}

export { useDashboard }
