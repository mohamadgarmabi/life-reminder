import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { getYear } from 'date-fns-jalali'
import { toast } from '#/components/sonner'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { isAiAvailable } from '#/modules/shell/apis/ai.api'
import { formatJalaliYear, toLocalDigits } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'
import { planRepo } from '#/modules/plans/apis/plans.api'
import { STATUS, STATUS_ORDER } from '#/modules/plans/utils/plans.constants'
import { planReport } from '#/modules/plans/utils/report'
import type { Plan, PlanFormValues, PlansDialog } from '#/modules/plans/types'

const SORT_OPTIONS = [
  { value: 'status', labelKey: 'plans.sortStatus' },
  { value: 'newest', labelKey: 'plans.sortNewest' },
  { value: 'updated', labelKey: 'plans.sortUpdated' },
  { value: 'title', labelKey: 'plans.sortTitle' },
] as const

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
      toast.error(e instanceof Error ? e.message : t('plans.saveError'))
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
    plans: visible.map((plan) => ({
      plan,
      onEdit: () => setDialog({ type: 'edit', item: plan }),
      onTutor: isAiAvailable ? () => setDialog({ type: 'tutor', item: plan }) : undefined,
    })),
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: q.status === 'success' && !items.length,
    hasItems: items.length > 0,
    isFilterEmpty: items.length > 0 && !visible.length,
    listLabel: t('plans.count', { n: toLocalDigits(visible.length) }),
    filter,
    filters: [
      // Counts live in the report card's stats; repeating them here overflows the pill on phones.
      { value: 'all', label: t('plans.filterAll') },
      ...STATUS_ORDER.map((s) => ({ value: s, label: STATUS[s].label })),
    ],
    handleFilterChange: setFilter,
    activeFilterCount: [year !== String(currentYear), sort !== 'status', tag !== 'all'].filter(Boolean).length,
    handleResetFilters: () => {
      setYear(String(currentYear))
      setSort('status')
      setTag('all')
    },
    report: {
      percent: report.percent,
      percentLabel: t('plans.percent', { n: toLocalDigits(report.percent) }),
      title:
        year === 'all'
          ? t('plans.progressAllYears')
          : t('plans.progressYear', { year: formatJalaliYear(Number(year)) }),
      detail: t('plans.progressDetail', {
        done: toLocalDigits(report.counts.done),
        total: toLocalDigits(report.total),
      }),
      stats: STATUS_ORDER.map((s) => ({ key: s, label: STATUS[s].label, value: toLocalDigits(report.counts[s]) })),
    },
    year,
    yearOptions: [
      { value: 'all', label: t('plans.allYears') },
      ...years.map((y) => ({ value: String(y), label: formatJalaliYear(y) })),
    ],
    handleYearChange: setYear,
    sort,
    sortOptions: SORT_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) })),
    handleSortChange: setSort,
    tag,
    hasTags: allTags.length > 0,
    tagOptions: [{ value: 'all', label: t('plans.allTags') }, ...allTags.map((t) => ({ value: t, label: t }))],
    handleTagChange: setTag,
    // new plans default to the year being viewed
    defaultYear: year === 'all' ? currentYear : Number(year),
    isFormOpen: dialog?.type === 'create' || dialog?.type === 'edit',
    tutorPlan: dialog?.type === 'tutor' ? dialog.item : undefined,
    tutorTitle: dialog?.type === 'tutor' ? t('plans.tutorTitle', { title: dialog.item.title }) : t('plans.tutor'),
    formTitle: editItem ? t('plans.edit') : t('plans.new'),
    editItem,
    handleOpenCreate: () => setDialog({ type: 'create' }),
    handleOpenChange: (o: boolean) => {
      if (!o) close()
    },
    handleCreate: (v: PlanFormValues) => save(planRepo.create(v), t('plans.added')),
    // the edit form only renders while editItem is set
    handleUpdate: async (v: PlanFormValues) => {
      if (editItem) await save(planRepo.update(editItem.id, v), t('plans.updated'))
    },
  }
}

export { usePlans }
