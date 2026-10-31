import { ErrorState, ListSkeleton } from '#/components/shared/states'
import { useLiveQuery } from '#/db/live'
import { formatDateLong, formatTime, relativeDay } from '#/lib/format'
import { plantRepo } from '../repository'

export function WateringHistory({ plantId }: { plantId: string }) {
  const q = useLiveQuery(() => plantRepo.waterings(plantId), [plantId])
  if (q.status === 'loading') return <ListSkeleton rows={2} />
  if (q.status === 'error') return <ErrorState error={q.error} />
  if (!q.data.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">هنوز آبیاری‌ای در برنامه ثبت نشده است.</p>
  }
  return (
    <ul className="divide-y">
      {q.data.map((w) => (
        <li key={w.id} className="flex items-center justify-between py-3">
          <span>{formatDateLong(w.date)}</span>
          <span className="text-xs text-muted-foreground">
            {relativeDay(w.date)} · ساعت {formatTime(new Date(w.wateredAt))}
          </span>
        </li>
      ))}
    </ul>
  )
}
