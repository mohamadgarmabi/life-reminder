import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { formatDateLong, formatTime, relativeDay } from '#/modules/shell/utils/format'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import type { WateringHistoryProps } from '#/modules/plants/types'

const useWateringHistory = ({ plantId }: WateringHistoryProps) => {
  const q = useLiveQuery(() => plantRepo.waterings(plantId), [plantId])
  const rows = (q.status === 'success' ? q.data : []).map((w) => ({
    id: w.id,
    dateLabel: formatDateLong(w.date),
    relativeLabel: relativeDay(w.date),
    timeLabel: formatTime(new Date(w.wateredAt)),
  }))
  return {
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: q.status === 'success' && !rows.length,
    rows,
  }
}

export { useWateringHistory }
