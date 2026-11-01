import { ErrorState, ListSkeleton } from '#/modules/shell/components/states'
import { usePaymentHistory } from '#/modules/installments/hooks/payment-history.hook'
import type { PaymentHistoryProps } from '#/modules/installments/types'

const PaymentHistory = ({ inst }: PaymentHistoryProps) => {
  const { isLoading, error, isEmpty, rows } = usePaymentHistory({ inst })
  if (isLoading) return <ListSkeleton rows={2} />
  if (error) return <ErrorState error={error} />
  if (isEmpty) {
    return <p className="py-6 text-center text-sm text-muted-foreground">هنوز پرداختی در برنامه ثبت نشده است.</p>
  }
  return (
    <ul className="divide-y">
      {rows.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 py-3">
          <div>
            <p className="font-medium">قسط {p.indexLabel}</p>
            <p className="text-xs text-muted-foreground">
              سررسید {p.dueLabel} · پرداخت {p.paidLabel}
            </p>
          </div>
          <span className="text-sm">{p.amountLabel}</span>
        </li>
      ))}
    </ul>
  )
}

export { PaymentHistory }
