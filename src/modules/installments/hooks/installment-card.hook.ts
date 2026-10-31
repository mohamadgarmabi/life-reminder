import { useState } from 'react'
import { toast } from 'sonner'
import { formatDateLong, formatMoney, relativeDay, toFaDigits } from '#/modules/shell/utils/format'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import type { InstallmentCardProps, InstallmentStatus } from '#/modules/installments/types'
import { installmentStatus, nextPayment, remainingPayments } from '#/modules/installments/utils/schedule'

const STATUS: Record<
  InstallmentStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  overdue: { label: 'معوق', variant: 'destructive' },
  today: { label: 'سررسید امروز', variant: 'default' },
  soon: { label: 'نزدیک', variant: 'default' },
  upcoming: { label: 'در جریان', variant: 'outline' },
  paused: { label: 'غیرفعال', variant: 'secondary' },
  done: { label: 'تسویه شد', variant: 'secondary' },
}

const showError = (e: unknown) => {
  toast.error(e instanceof Error ? e.message : 'خطا در ذخیره‌سازی')
}

const useInstallmentCard = ({ inst, today }: Pick<InstallmentCardProps, 'inst' | 'today'>) => {
  const [paying, setPaying] = useState(false)
  const next = nextPayment(inst)
  const status = installmentStatus(inst, today)
  const progress = (inst.paidPayments / inst.totalPayments) * 100

  const handlePay = async () => {
    if (!next) return
    setPaying(true)
    try {
      const payment = await installmentRepo.markPaid(inst.id, next.index)
      toast.success(`قسط ${toFaDigits(next.index + 1)} «${inst.title}» ثبت شد.`, {
        action: { label: 'بازگردانی', onClick: () => void installmentRepo.undoPayment(payment.id).catch(showError) },
      })
    } catch (e) {
      showError(e)
    } finally {
      setPaying(false)
    }
  }

  return {
    paying,
    progress,
    hasNext: !!next,
    statusLabel: STATUS[status].label,
    statusVariant: STATUS[status].variant,
    amountLabel: formatMoney(inst.amount, inst.currency),
    menuAriaLabel: `گزینه‌های ${inst.title}`,
    paidCountLabel: toFaDigits(inst.paidPayments),
    totalCountLabel: toFaDigits(inst.totalPayments),
    remainingLabel: next && `، ${toFaDigits(remainingPayments(inst))} قسط باقی‌مانده`,
    nextDueLabel: next ? formatDateLong(next.dueDate) : '',
    nextRelativeLabel: next ? relativeDay(next.dueDate) : '',
    relativeClassName: status === 'overdue' ? 'font-medium text-destructive' : 'text-muted-foreground',
    handlePay,
  }
}

export { useInstallmentCard }
