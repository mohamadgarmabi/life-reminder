import { ErrorState, ListSkeleton } from '#/modules/shell/components/states'
import { useWateringHistory } from '#/modules/plants/hooks/watering-history.hook'
import type { WateringHistoryProps } from '#/modules/plants/types'
import { t } from '#/modules/shell/utils/i18n'

const WateringHistory = ({ plantId }: WateringHistoryProps) => {
  const { isLoading, error, isEmpty, rows } = useWateringHistory({ plantId })
  if (isLoading) return <ListSkeleton rows={2} />
  if (error) return <ErrorState error={error} />
  if (isEmpty) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{t('plants.historyEmpty')}</p>
  }
  return (
    <ul className="divide-y">
      {rows.map((row) => (
        <li key={row.id} className="flex items-center justify-between py-3">
          <span>{row.dateLabel}</span>
          <span className="text-xs text-muted-foreground">{row.timeLabel}</span>
        </li>
      ))}
    </ul>
  )
}

export { WateringHistory }
