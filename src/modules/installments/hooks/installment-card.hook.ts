import { t, type MessageKey } from '#/modules/shell/utils/i18n'
import { useState } from 'react'
import { toast } from '#/components/sonner'
import { formatDate, formatDateLong, formatMoney, relativeDay, toLocalDigits } from '#/modules/shell/utils/format'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import type { InstallmentCardProps, InstallmentStatus } from '#/modules/installments/types'
import {
  installmentStatus,
  nextPayment,
  paymentDueDate,
  remainingPayments,
} from '#/modules/installments/utils/schedule'

const STATUS: Record<
  InstallmentStatus,
  { label: MessageKey; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  overdue: { label: 'installments.status.overdue', variant: 'destructive' },
  today: { label: 'installments.status.today', variant: 'default' },
  soon: { label: 'installments.status.soon', variant: 'default' },
  upcoming: { label: 'installments.status.upcoming', variant: 'outline' },
  paused: { label: 'installments.status.paused', variant: 'secondary' },
  done: { label: 'installments.status.done', variant: 'secondary' },
}

const showError = (e: unknown) => {
  toast.error(e instanceof Error ? e.message : t('installments.saveError'))
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
      toast.success(t('installments.card.paidToast', { n: toLocalDigits(next.index + 1), title: inst.title }), {
        action: {
          label: t('installments.card.undo'),
          onClick: () => void installmentRepo.undoPayment(payment.id).catch(showError),
        },
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
    statusLabel: t(STATUS[status].label),
    statusVariant: STATUS[status].variant,
    amountLabel: formatMoney(inst.amount, inst.currency),
    menuAriaLabel: t('installments.card.menu', { title: inst.title }),
    progressLabel:
      t('installments.card.paidOf', {
        paid: toLocalDigits(inst.paidPayments),
        total: toLocalDigits(inst.totalPayments),
      }) + (next ? t('installments.card.remaining', { n: toLocalDigits(remainingPayments(inst)) }) : ''),
    lastDueLabel: t('installments.card.lastDue', { date: formatDate(paymentDueDate(inst, inst.totalPayments - 1)) }),
    nextDueLabel: next ? formatDateLong(next.dueDate) : '',
    nextRelativeLabel: next ? relativeDay(next.dueDate) : '',
    relativeClassName: status === 'overdue' ? 'font-medium text-destructive' : 'text-muted-foreground',
    handlePay,
  }
}

export { useInstallmentCard }
