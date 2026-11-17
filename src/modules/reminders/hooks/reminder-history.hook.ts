import { AlarmClock, Check } from 'lucide-react'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { formatDateTime } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'
import { reminderRepo } from '#/modules/reminders/apis/reminders.api'
import type { ReminderHistoryProps } from '#/modules/reminders/types'

const useReminderHistory = ({ reminderId }: ReminderHistoryProps) => {
  const q = useLiveQuery(() => reminderRepo.events(reminderId), [reminderId])
  const events = (q.data ?? []).map((e) => {
    const completed = e.type === 'completed'
    return {
      id: e.id,
      Icon: completed ? Check : AlarmClock,
      iconClassName: completed ? 'mt-0.5 size-4 text-primary' : 'mt-0.5 size-4 text-warning',
      label: t(completed ? 'reminders.history.completed' : 'reminders.history.snoozed'),
      detail: t('reminders.history.detail', {
        occurrence: formatDateTime(new Date(e.occurrenceAt)),
        at: formatDateTime(new Date(e.at)),
      }),
    }
  })

  return {
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: q.status === 'success' && !q.data.length,
    events,
  }
}

export { useReminderHistory }
