import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { getYear } from 'date-fns-jalali'
import { toast } from '#/components/sonner'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { toFaDigits } from '#/modules/shell/utils/format'
import { planRepo } from '#/modules/plans/apis/plans.api'
import { STATUS, STATUS_ORDER } from '#/modules/plans/utils/plans.constants'
import { planReport } from '#/modules/plans/utils/report'
import type { Plan, PlanFormValues, PlansDialog } from '#/modules/plans/types'

const SORT_OPTIONS = [
  { value: 'status', label: 'مرتب‌سازی: وضعیت' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'updated', label: 'آخرین تغییر' },
  { value: 'title', label: 'عنوان' },
]

const byStatus = (a: Plan, b: Plan) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
const SORTS: Record<string, (a: Plan, b: Plan) => number> = {
  status: byStatus,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  title: (a, b) => a.title.localeCompare(b.title, 'fa'),
}

const usePlans = () => {
  const currentYear = getYear(new Date())
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('status')
  const [tag, setTag] = useState('all')
  const [year, setYear] = useState(String(currentYear))
  const search = useSearch({ from: '/plans' })
  const navigate = useNavigate({ from: '/plans' })
  const [dialog, setDialog] = useState<PlansDialog>(search.new ? { type: 'create' } : null)
  const close = () => {
    setDialog(null)
    if (search.new) void navigate({ search: {}, replace: true })
  }
  const q = useLiveQuery(() => planRepo.list())

  const save = async (task: Promise<unknown>, message: string) => {
    try {
      await task
      toast.success(message)
      close()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا در ذخیره‌سازی')
    }
  }

  const items = [...(q.data ?? [])].sort((a, b) => (SORTS[sort] ?? byStatus)(a, b) || byStatus(a, b))
  // The report covers the chosen year + tag; the status tabs only narrow the list below it.
  const inScope = items.filter(
    (p) => (year === 'all' || p.year === Number(year)) && (tag === 'all' || p.tags.includes(tag)),
  )
  const report = planReport(inScope)
  const visible = inScope.filter((p) => filter === 'all' || p.status === filter)

  const years = [...new Set([currentYear, ...items.map((p) => p.year)])].sort((a, b) => b - a)
  const allTags = [...new Set(items.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b, 'fa'))
  const editItem = dialog?.type === 'edit' ? dialog.item : undefined

  return {
    plans: visible.map((plan) => ({ plan, onEdit: () => setDialog({ type: 'edit', item: plan }) })),
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: q.status === 'success' && !items.length,
    hasItems: items.length > 0,
    isFilterEmpty: items.length > 0 && !visible.length,
    filter,
    filters: [
      { value: 'all', label: `همه (${toFaDigits(report.total)})` },
      ...STATUS_ORDER.map((s) => ({ value: s, label: `${STATUS[s].label} (${toFaDigits(report.counts[s])})` })),
    ],
    handleFilterChange: setFilter,
    report: {
      percent: report.percent,
      percentLabel: `${toFaDigits(report.percent)}٪`,
      title: year === 'all' ? 'پیشرفت همهٔ سال‌ها' : `پیشرفت سال ${toFaDigits(year)}`,
      detail: `${toFaDigits(report.counts.done)} از ${toFaDigits(report.total)} برنامه انجام شده`,
      stats: STATUS_ORDER.map((s) => ({ key: s, label: STATUS[s].label, value: toFaDigits(report.counts[s]) })),
    },
    year,
    yearOptions: [
      { value: 'all', label: 'همهٔ سال‌ها' },
      ...years.map((y) => ({ value: String(y), label: toFaDigits(y) })),
    ],
    handleYearChange: setYear,
    sort,
    sortOptions: SORT_OPTIONS,
    handleSortChange: setSort,
    tag,
    hasTags: allTags.length > 0,
    tagOptions: [{ value: 'all', label: 'همهٔ تگ‌ها' }, ...allTags.map((t) => ({ value: t, label: t }))],
    handleTagChange: setTag,
    // new plans default to the year being viewed
    defaultYear: year === 'all' ? currentYear : Number(year),
    isFormOpen: dialog !== null,
    formTitle: editItem ? 'ویرایش برنامه' : 'برنامهٔ جدید',
    editItem,
    handleOpenCreate: () => setDialog({ type: 'create' }),
    handleOpenChange: (o: boolean) => {
      if (!o) close()
    },
    handleCreate: (v: PlanFormValues) => save(planRepo.create(v), 'برنامه اضافه شد.'),
    // the edit form only renders while editItem is set
    handleUpdate: async (v: PlanFormValues) => {
      if (editItem) await save(planRepo.update(editItem.id, v), 'تغییرات ذخیره شد.')
    },
  }
}

export { usePlans }
