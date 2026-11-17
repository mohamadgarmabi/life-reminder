import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from '#/components/sonner'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { toIsoDate } from '#/modules/shell/utils/dates'
import { formatMoney, localYear, monthNames, toLocalDigits } from '#/modules/shell/utils/format'
import { useNow } from '#/modules/shell/hooks/now.hook'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import type { Installment, InstallmentFormValues } from '#/modules/installments/types'
import { t } from '#/modules/shell/utils/i18n'
import {
  installmentStatus,
  nextPayment,
  paymentDueDate,
  paymentsIn,
  remainingPayments,
} from '#/modules/installments/utils/schedule'

type Dialog = { type: 'create' } | { type: 'edit' | 'history'; item: Installment } | null

const ORDER = ['overdue', 'today', 'soon', 'upcoming', 'paused', 'done']

const SORT_OPTIONS = [
  { value: 'status', label: 'installments.sort.status' },
  { value: 'next', label: 'installments.sort.next' },
  { value: 'amount', label: 'installments.sort.amount' },
  { value: 'remaining', label: 'installments.sort.remaining' },
  { value: 'end', label: 'installments.sort.end' },
] as const

const FILTERS = [
  { value: 'all', label: 'installments.filter.all', match: () => true },
  { value: 'running', label: 'installments.filter.running', match: (s: string) => s !== 'done' && s !== 'paused' },
  { value: 'overdue', label: 'installments.filter.overdue', match: (s: string) => s === 'overdue' },
  { value: 'done', label: 'installments.filter.done', match: (s: string) => s === 'done' },
] as const

const useInstallments = () => {
  const search = useSearch({ from: '/installments' })
  const navigate = useNavigate({ from: '/installments' })
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('status')
  const [tag, setTag] = useState('all')
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
      toast.error(e instanceof Error ? e.message : t('installments.saveError'))
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
  const filters = FILTERS.map((f) => ({ value: f.value, label: t(f.label) }))
  const match: (s: string) => boolean = FILTERS.find((f) => f.value === filter)?.match ?? (() => true)

  // Filter years/months follow the display calendar (Jalali in Persian, Gregorian in English).
  const yearOf = (i: Installment, n: number) => localYear(paymentDueDate(i, n))
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
  const allTags = [...new Set(items.flatMap((i) => i.tags))].sort((a, b) => a.localeCompare(b, 'fa'))
  const visible = items.filter(
    (i) => match(statusOf(i)) && periodCount(i) > 0 && (tag === 'all' || i.tags.includes(tag)),
  )
  const periodTotal = visible.reduce((sum, i) => sum + periodCount(i) * i.amount, 0)
  const months = monthNames()
  const periodLabel = `${month === 'all' ? '' : `${months[Number(month)]} `}${toLocalDigits(year)}`

  const cards = visible.map((inst) => ({
    inst,
    onEdit: () => setDialog({ type: 'edit', item: inst }),
    onHistory: () => setDialog({ type: 'history', item: inst }),
    onDelete: () => void save(installmentRepo.remove(inst.id), t('installments.deleted')),
  }))

  const editItem = dialog?.type === 'edit' ? dialog.item : undefined
  const historyItem = dialog?.type === 'history' ? dialog.item : undefined

  return {
    today,
    cards,
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: q.status === 'success' && !items.length,
    hasItems: items.length > 0,
    isFilterEmpty: items.length > 0 && !cards.length,
    listLabel: t(cards.length === 1 ? 'installments.list.one' : 'installments.list.many', {
      n: toLocalDigits(cards.length),
    }),
    filters,
    filter,
    handleFilterChange: setFilter,
    activeFilterCount: [year !== 'all', month !== 'all', sort !== 'status', tag !== 'all'].filter(Boolean).length,
    handleResetFilters: () => {
      setYear('all')
      setMonth('all')
      setSort('status')
      setTag('all')
    },
    year,
    month,
    yearOptions: [
      { value: 'all', label: t('installments.filter.allYears') },
      ...years.map((y) => ({ value: String(y), label: toLocalDigits(y) })),
    ],
    monthOptions: [
      { value: 'all', label: t('installments.filter.allMonths') },
      ...months.map((label, m) => ({ value: String(m), label })),
    ],
    isMonthDisabled: year === 'all',
    periodSummary:
      year === 'all'
        ? undefined
        : t('installments.periodSummary', { period: periodLabel, total: formatMoney(periodTotal) }),
    handleYearChange: (v: string) => {
      setYear(v)
      if (v === 'all') setMonth('all')
    },
    handleMonthChange: setMonth,
    sort,
    sortOptions: SORT_OPTIONS.map((o) => ({ value: o.value, label: t(o.label) })),
    handleSortChange: setSort,
    tag,
    hasTags: allTags.length > 0,
    tagOptions: [
      { value: 'all', label: t('installments.filter.allTags') },
      ...allTags.map((tg) => ({ value: tg, label: tg })),
    ],
    handleTagChange: setTag,
    headerDescription: items.length
      ? t('installments.header', { monthly: formatMoney(monthlyTotal), remaining: formatMoney(remainingTotal) })
      : undefined,
    isFormOpen: dialog?.type === 'create' || dialog?.type === 'edit',
    formTitle: t(dialog?.type === 'edit' ? 'installments.edit' : 'installments.new'),
    isCreate: dialog?.type === 'create',
    editItem,
    historyItem,
    isHistoryOpen: !!historyItem,
    handleOpenCreate: () => setDialog({ type: 'create' }),
    handleOpenChange: (o: boolean) => {
      if (!o) close()
    },
    handleCreate: (v: InstallmentFormValues) => save(installmentRepo.create(v), t('installments.added')),
    // the edit form only renders while editItem is set
    handleUpdate: async (v: InstallmentFormValues) => {
      if (editItem) await save(installmentRepo.update(editItem.id, v), t('installments.saved'))
    },
  }
}

export { useInstallments }
