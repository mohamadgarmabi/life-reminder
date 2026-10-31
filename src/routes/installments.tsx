import { createFileRoute } from '@tanstack/react-router'
import { Plus, Wallet } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConfirmDialog, FormDialog } from '#/components/shared/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/components/shared/states'
import { Button } from '#/components/ui/button'
import { useLiveQuery } from '#/db/live'
import { InstallmentCard } from '#/features/installments/components/installment-card'
import { InstallmentForm } from '#/features/installments/components/installment-form'
import { PaymentHistory } from '#/features/installments/components/payment-history'
import { installmentRepo } from '#/features/installments/repository'
import type { Installment } from '#/features/installments/schema'
import { installmentStatus, nextPayment, remainingPayments } from '#/features/installments/schedule'
import { toIsoDate } from '#/lib/dates'
import { formatMoney } from '#/lib/format'
import { useNow } from '#/lib/use-now'

export const Route = createFileRoute('/installments')({
  validateSearch: z.object({ new: z.boolean().optional() }),
  component: InstallmentsPage,
})

type Dialog =
  | { type: 'create' }
  | { type: 'edit' | 'history' | 'delete'; item: Installment }
  | null

const ORDER = ['overdue', 'today', 'soon', 'upcoming', 'paused', 'done']

function InstallmentsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [dialog, setDialog] = useState<Dialog>(search.new ? { type: 'create' } : null)
  const today = toIsoDate(useNow())
  const q = useLiveQuery(() => installmentRepo.list())

  const close = () => {
    setDialog(null)
    if (search.new) void navigate({ search: {}, replace: true })
  }
  const save = async (task: Promise<unknown>, message: string) => {
    try {
      await task
      toast.success(message)
      close()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا در ذخیره‌سازی')
    }
  }

  const items = [...(q.data ?? [])].sort((a, b) => {
    const s = ORDER.indexOf(installmentStatus(a, today)) - ORDER.indexOf(installmentStatus(b, today))
    return s || (nextPayment(a)?.dueDate ?? '').localeCompare(nextPayment(b)?.dueDate ?? '')
  })
  const remainingTotal = items
    .filter((i) => i.isActive)
    .reduce((sum, i) => sum + remainingPayments(i) * i.amount, 0)

  return (
    <>
      <PageHeader
        title="اقساط"
        description={items.length ? `مانده کل: ${formatMoney(remainingTotal)}` : undefined}
        action={
          <Button onClick={() => setDialog({ type: 'create' })}>
            <Plus /> قسط جدید
          </Button>
        }
      />

      {q.status === 'loading' && <ListSkeleton />}
      {q.status === 'error' && <ErrorState error={q.error} />}
      {q.status === 'success' && !items.length && (
        <EmptyState
          icon={Wallet}
          title="قسطی ثبت نشده"
          description="وام‌ها و پرداخت‌های ماهانه را اضافه کنید تا سررسیدها را فراموش نکنید."
          action={<Button onClick={() => setDialog({ type: 'create' })}><Plus /> افزودن قسط</Button>}
        />
      )}
      <div className="space-y-3">
        {items.map((inst) => (
          <InstallmentCard
            key={inst.id}
            inst={inst}
            today={today}
            onEdit={() => setDialog({ type: 'edit', item: inst })}
            onHistory={() => setDialog({ type: 'history', item: inst })}
            onDelete={() => setDialog({ type: 'delete', item: inst })}
          />
        ))}
      </div>

      <FormDialog
        open={dialog?.type === 'create' || dialog?.type === 'edit'}
        onOpenChange={(o) => !o && close()}
        title={dialog?.type === 'edit' ? 'ویرایش قسط' : 'قسط جدید'}
      >
        {dialog?.type === 'create' && (
          <InstallmentForm onSubmit={(v) => save(installmentRepo.create(v), 'قسط اضافه شد.')} />
        )}
        {dialog?.type === 'edit' && (
          <InstallmentForm
            initial={dialog.item}
            onSubmit={(v) => save(installmentRepo.update(dialog.item.id, v), 'تغییرات ذخیره شد.')}
          />
        )}
      </FormDialog>

      <FormDialog
        open={dialog?.type === 'history'}
        onOpenChange={(o) => !o && close()}
        title="سابقهٔ پرداخت"
        description={dialog?.type === 'history' ? dialog.item.title : undefined}
      >
        {dialog?.type === 'history' && <PaymentHistory inst={dialog.item} />}
      </FormDialog>

      <ConfirmDialog
        open={dialog?.type === 'delete'}
        onOpenChange={(o) => !o && close()}
        title="حذف قسط؟"
        description={
          dialog?.type === 'delete'
            ? `«${dialog.item.title}» و سابقهٔ پرداخت آن برای همیشه حذف می‌شود.`
            : ''
        }
        onConfirm={() => dialog?.type === 'delete' && void save(installmentRepo.remove(dialog.item.id), 'قسط حذف شد.')}
      />
    </>
  )
}
