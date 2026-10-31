import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { toIsoDate } from '#/modules/shell/utils/dates'
import { formatMoney } from '#/modules/shell/utils/format'
import { useNow } from '#/modules/shell/hooks/now.hook'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import type { Installment, InstallmentFormValues } from '#/modules/installments/types'
import { installmentStatus, nextPayment, remainingPayments } from '#/modules/installments/utils/schedule'

type Dialog = { type: 'create' } | { type: 'edit' | 'history' | 'delete'; item: Installment } | null

const ORDER = ['overdue', 'today', 'soon', 'upcoming', 'paused', 'done']

const useInstallments = () => {
  const search = useSearch({ from: '/installments' })
  const navigate = useNavigate({ from: '/installments' })
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
  const remainingTotal = items.filter((i) => i.isActive).reduce((sum, i) => sum + remainingPayments(i) * i.amount, 0)

  const cards = items.map((inst) => ({
    inst,
    onEdit: () => setDialog({ type: 'edit', item: inst }),
    onHistory: () => setDialog({ type: 'history', item: inst }),
    onDelete: () => setDialog({ type: 'delete', item: inst }),
  }))

  const editItem = dialog?.type === 'edit' ? dialog.item : undefined
  const historyItem = dialog?.type === 'history' ? dialog.item : undefined
  const deleteItem = dialog?.type === 'delete' ? dialog.item : undefined

  return {
    today,
    cards,
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: q.status === 'success' && !items.length,
    headerDescription: items.length ? `مانده کل: ${formatMoney(remainingTotal)}` : undefined,
    isFormOpen: dialog?.type === 'create' || dialog?.type === 'edit',
    formTitle: dialog?.type === 'edit' ? 'ویرایش قسط' : 'قسط جدید',
    isCreate: dialog?.type === 'create',
    editItem,
    historyItem,
    isHistoryOpen: !!historyItem,
    isDeleteOpen: !!deleteItem,
    deleteDescription: deleteItem ? `«${deleteItem.title}» و سابقهٔ پرداخت آن برای همیشه حذف می‌شود.` : '',
    handleOpenCreate: () => setDialog({ type: 'create' }),
    handleOpenChange: (o: boolean) => {
      if (!o) close()
    },
    handleCreate: (v: InstallmentFormValues) => save(installmentRepo.create(v), 'قسط اضافه شد.'),
    // the edit form only renders while editItem is set
    handleUpdate: async (v: InstallmentFormValues) => {
      if (editItem) await save(installmentRepo.update(editItem.id, v), 'تغییرات ذخیره شد.')
    },
    handleDelete: () => {
      if (deleteItem) void save(installmentRepo.remove(deleteItem.id), 'قسط حذف شد.')
    },
  }
}

export { useInstallments }
