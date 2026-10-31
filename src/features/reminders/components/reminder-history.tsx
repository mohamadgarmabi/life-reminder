import { AlarmClock, Check } from 'lucide-react'
import { ErrorState, ListSkeleton } from '#/components/shared/states'
import { useLiveQuery } from '#/db/live'
import { formatDateTime } from '#/lib/format'
import { reminderRepo } from '../repository'

export function ReminderHistory({ reminderId }: { reminderId: string }) {
  const q = useLiveQuery(() => reminderRepo.events(reminderId), [reminderId])
  if (q.status === 'loading') return <ListSkeleton rows={2} />
  if (q.status === 'error') return <ErrorState error={q.error} />
  if (!q.data.length) return <p className="py-6 text-center text-sm text-muted-foreground">هنوز سابقه‌ای ثبت نشده است.</p>
  return (
    <ul className="divide-y">
      {q.data.map((e) => (
        <li key={e.id} className="flex items-start gap-3 py-3">
          {e.type === 'completed' ? (
            <Check className="mt-0.5 size-4 text-primary" aria-hidden />
          ) : (
            <AlarmClock className="mt-0.5 size-4 text-warning" aria-hidden />
          )}
          <div>
            <p className="text-sm font-medium">{e.type === 'completed' ? 'انجام شد' : 'به تعویق افتاد'}</p>
            <p className="text-xs text-muted-foreground">
              نوبت {formatDateTime(new Date(e.occurrenceAt))} · ثبت {formatDateTime(new Date(e.at))}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
