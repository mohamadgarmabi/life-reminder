import { ErrorState, ListSkeleton } from '#/components/shared/states'
import { useLiveQuery } from '#/db/live'
import { formatDate, formatDateTime, formatMoney, toFaDigits } from '#/lib/format'
import { installmentRepo } from '../repository'
import type { Installment } from '../schema'

export function PaymentHistory({ inst }: { inst: Installment }) {
  const q = useLiveQuery(() => installmentRepo.payments(inst.id), [inst.id])
  if (q.status === 'loading') return <ListSkeleton rows={2} />
  if (q.status === 'error') return <ErrorState error={q.error} />
  if (!q.data.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">هنوز پرداختی در برنامه ثبت نشده است.</p>
  }
  return (
    <ul className="divide-y">
      {q.data.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 py-3">
          <div>
            <p className="font-medium">قسط {toFaDigits(p.index + 1)}</p>
            <p className="text-xs text-muted-foreground">
              سررسید {formatDate(p.dueDate)} · پرداخت {formatDateTime(new Date(p.paidAt))}
            </p>
          </div>
          <span className="text-sm">{formatMoney(p.amount, inst.currency)}</span>
        </li>
      ))}
    </ul>
  )
}
