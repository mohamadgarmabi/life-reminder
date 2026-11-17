import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { formatDateLong, formatTime, relativeDay } from '#/modules/shell/utils/format'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import type { WateringHistoryProps } from '#/modules/plants/types'
import { t } from '#/modules/shell/utils/i18n'

const useWateringHistory = ({ plantId }: WateringHistoryProps) => {
  const q = useLiveQuery(() => plantRepo.waterings(plantId), [plantId])
  const rows = (q.status === 'success' ? q.data : []).map((w) => ({
    id: w.id,
    dateLabel: formatDateLong(w.date),
    timeLabel: t('plants.historyTime', { relative: relativeDay(w.date), time: formatTime(new Date(w.wateredAt)) }),
  }))
  return {
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: q.status === 'success' && !rows.length,
    rows,
  }
}

export { useWateringHistory }
