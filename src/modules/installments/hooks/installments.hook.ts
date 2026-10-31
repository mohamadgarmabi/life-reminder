import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { toIsoDate } from '#/modules/shell/utils/dates'
import { formatMoney, toFaDigits } from '#/modules/shell/utils/format'
import { useNow } from '#/modules/shell/hooks/now.hook'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import type { Installment, InstallmentFormValues } from '#/modules/installments/types'
import { getYear } from 'date-fns-jalali'
import { JALALI_MONTHS } from '#/modules/shell/hooks/form-fields.hook'
import { parseIsoDate } from '#/modules/shell/utils/dates'
import {
  installmentStatus,
  nextPayment,
  paymentDueDate,
  paymentsIn,
  remainingPayments,
} from '#/modules/installments/utils/schedule'

type Dialog = { type: 'create' } | { type: 'edit' | 'history' | 'delete'; item: Installment } | null

const ORDER = ['overdue', 'today', 'soon', 'upcoming', 'paused', 'done']

const SORT_OPTIONS = [
  { value: 'status', label: 'مرتب‌سازی: وضعیت' },
  { value: 'next', label: 'نزدیک‌ترین سررسید' },
  { value: 'amount', label: 'بیشترین مبلغ قسط' },
  { value: 'remaining', label: 'بیشترین مانده' },
  { value: 'end', label: 'زودترین پایان اقساط' },
]

const FILTERS = [
  { value: 'all', label: 'همه', match: () => true },
  { value: 'running', label: 'در جریان', match: (s: string) => s !== 'done' && s !== 'paused' },
  { value: 'overdue', label: 'معوق', match: (s: string) => s === 'overdue' },
  { value: 'done', label: 'تسویه', match: (s: string) => s === 'done' },
]

const useInstallments = () => {
  const search = useSearch({ from: '/installments' })
  const navigate = useNavigate({ from: '/installments' })
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('status')
  const [year, setYear] = useState('all')
  const [month, setMonth] = useState('all')
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

  const byStatus = (a: Installment, b: Installment) =>
    ORDER.indexOf(installmentStatus(a, today)) - ORDER.indexOf(installmentStatus(b, today))
  // '~' sorts after any date, so finished installments go last
  const nextDue = (i: Installment) => nextPayment(i)?.dueDate ?? '~'
  const lastDue = (i: Installment) => paymentDueDate(i, i.totalPayments - 1)
  const SORTS: Record<string, (a: Installment, b: Installment) => number> = {
    status: (a, b) => byStatus(a, b) || nextDue(a).localeCompare(nextDue(b)),
    next: (a, b) => nextDue(a).localeCompare(nextDue(b)),
    amount: (a, b) => b.amount - a.amount,
    remaining: (a, b) => remainingPayments(b) * b.amount - remainingPayments(a) * a.amount,
    end: (a, b) => lastDue(a).localeCompare(lastDue(b)),
  }
  const items = [...(q.data ?? [])].sort((a, b) => (SORTS[sort] ?? SORTS.status)(a, b) || byStatus(a, b))
  const active = items.filter((i) => i.isActive)
  const remainingTotal = active.reduce((sum, i) => sum + remainingPayments(i) * i.amount, 0)
  const monthlyTotal = active.reduce((sum, i) => sum + (remainingPayments(i) ? i.amount : 0), 0)
  const statusOf = (i: Installment) => installmentStatus(i, today)
  const filters = FILTERS.map((f) => ({
    value: f.value,
    label: `${f.label} (${toFaDigits(items.filter((i) => f.match(statusOf(i))).length)})`,
  }))
  const match = FILTERS.find((f) => f.value === filter)?.match ?? (() => true)

  const yearOf = (i: Installment, n: number) => getYear(parseIsoDate(paymentDueDate(i, n)))
  const years = items.length
    ? Array.from(
        {
          length:
            Math.max(...items.map((i) => yearOf(i, i.totalPayments - 1))) -
            Math.min(...items.map((i) => yearOf(i, 0))) +
            1,
        },
        (_, k) => Math.min(...items.map((i) => yearOf(i, 0))) + k,
      )
    : []
  const periodCount = (i: Installment) =>
    year === 'all' ? 1 : paymentsIn(i, Number(year), month === 'all' ? undefined : Number(month))
  const visible = items.filter((i) => match(statusOf(i)) && periodCount(i) > 0)
  const periodTotal = visible.reduce((sum, i) => sum + periodCount(i) * i.amount, 0)
  const periodLabel = `${month === 'all' ? '' : `${JALALI_MONTHS[Number(month)]} `}${toFaDigits(year)}`

  const cards = visible.map((inst) => ({
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
    hasItems: items.length > 0,
    isFilterEmpty: items.length > 0 && !cards.length,
    filters,
    filter,
    handleFilterChange: setFilter,
    year,
    month,
    yearOptions: [
      { value: 'all', label: 'همهٔ سال‌ها' },
      ...years.map((y) => ({ value: String(y), label: toFaDigits(y) })),
    ],
    monthOptions: [
      { value: 'all', label: 'همهٔ ماه‌ها' },
      ...JALALI_MONTHS.map((label, m) => ({ value: String(m), label })),
    ],
    isMonthDisabled: year === 'all',
    periodSummary: year === 'all' ? undefined : `جمع اقساط ${periodLabel}: ${formatMoney(periodTotal)}`,
    handleYearChange: (v: string) => {
      setYear(v)
      if (v === 'all') setMonth('all')
    },
    handleMonthChange: setMonth,
    sort,
    sortOptions: SORT_OPTIONS,
    handleSortChange: setSort,
    headerDescription: items.length
      ? `پرداخت ماهانه: ${formatMoney(monthlyTotal)} · مانده کل: ${formatMoney(remainingTotal)}`
      : undefined,
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
