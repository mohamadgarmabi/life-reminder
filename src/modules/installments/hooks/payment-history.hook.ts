import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { formatDate, formatDateTime, formatMoney, toFaDigits } from '#/modules/shell/utils/format'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import type { PaymentHistoryProps } from '#/modules/installments/types'

const usePaymentHistory = ({ inst }: PaymentHistoryProps) => {
  const q = useLiveQuery(() => installmentRepo.payments(inst.id), [inst.id])
  const rows = (q.data ?? []).map((p) => ({
    id: p.id,
    indexLabel: toFaDigits(p.index + 1),
    dueLabel: formatDate(p.dueDate),
    paidLabel: formatDateTime(new Date(p.paidAt)),
    amountLabel: formatMoney(p.amount, inst.currency),
  }))

  return {
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: !rows.length,
    rows,
  }
}

export { usePaymentHistory }
