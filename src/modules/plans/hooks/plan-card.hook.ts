import { toast } from '#/components/sonner'
import { toFaDigits } from '#/modules/shell/utils/format'
import { planRepo } from '#/modules/plans/apis/plans.api'
import { STATUS } from '#/modules/plans/utils/plans.constants'
import type { Plan, PlanStatus } from '#/modules/plans/types'

const showError = (e: unknown) => {
  toast.error(e instanceof Error ? e.message : 'خطا در ذخیره‌سازی')
}

const usePlanCard = (plan: Plan) => {
  const setStatus = (status: PlanStatus) => {
    const previous = plan.status
    planRepo
      .setStatus(plan.id, status)
      .then(() =>
        toast.success(`«${plan.title}»: ${STATUS[status].label}`, {
          action: { label: 'بازگردانی', onClick: () => void planRepo.setStatus(plan.id, previous).catch(showError) },
        }),
      )
      .catch(showError)
  }

  const handleDelete = () => {
    planRepo
      .remove(plan.id)
      .then(() =>
        toast.success('برنامه حذف شد.', {
          action: { label: 'بازگردانی', onClick: () => void planRepo.restore(plan).catch(showError) },
        }),
      )
      .catch(showError)
  }

  const isOpen = plan.status === 'planned' || plan.status === 'in-progress'
  // First action = full swipe. Finished plans get "reset" instead of done/skip.
  const swipeActions = [
    { id: 'delete', label: 'حذف', onSelect: handleDelete },
    ...(isOpen
      ? [
          { id: 'done', label: 'انجام شد', color: '#30a46c', onSelect: () => setStatus('done') },
          { id: 'skip', label: 'رد کردن', color: '#f5a524', onSelect: () => setStatus('skipped') },
        ]
      : [{ id: 'reset', label: 'بی‌وضعیت', color: '#8b8d98', onSelect: () => setStatus('planned') }]),
  ]

  return {
    swipeActions,
    statusLabel: STATUS[plan.status].label,
    statusVariant: STATUS[plan.status].variant,
    yearLabel: toFaDigits(plan.year),
    isFinished: !isOpen,
    menuAriaLabel: `گزینه‌های ${plan.title}`,
    // One tap moves the plan forward: planned → in progress → done.
    nextStep:
      plan.status === 'planned'
        ? { kind: 'start' as const, label: 'شروع', onClick: () => setStatus('in-progress') }
        : plan.status === 'in-progress'
          ? { kind: 'done' as const, label: 'انجام شد', onClick: () => setStatus('done') }
          : null,
  }
}

export { usePlanCard }
