import { ErrorState, ListSkeleton } from '#/modules/shell/components/states'
import { useReminderHistory } from '#/modules/reminders/hooks/reminder-history.hook'
import { t } from '#/modules/shell/utils/i18n'
import type { ReminderHistoryProps } from '#/modules/reminders/types'

const ReminderHistory = (props: ReminderHistoryProps) => {
  const { isLoading, error, isEmpty, events } = useReminderHistory(props)
  if (isLoading) return <ListSkeleton rows={2} />
  if (error) return <ErrorState error={error} />
  if (isEmpty) return <p className="py-6 text-center text-sm text-muted-foreground">{t('reminders.history.empty')}</p>
  return (
    <ul className="divide-y">
      {events.map((e) => (
        <li key={e.id} className="flex items-start gap-3 py-3">
          <e.Icon className={e.iconClassName} aria-hidden />
          <div>
            <p className="text-sm font-medium">{e.label}</p>
            <p className="text-xs text-muted-foreground">{e.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export { ReminderHistory }
