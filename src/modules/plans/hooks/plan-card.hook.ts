import { toast } from '#/components/sonner'
import { formatJalaliYear } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'
import { planRepo } from '#/modules/plans/apis/plans.api'
import { STATUS } from '#/modules/plans/utils/plans.constants'
import type { Plan, PlanStatus } from '#/modules/plans/types'

const showError = (e: unknown) => {
  toast.error(e instanceof Error ? e.message : t('plans.saveError'))
}

const usePlanCard = (plan: Plan) => {
  const setStatus = (status: PlanStatus) => {
    const previous = plan.status
    planRepo
      .setStatus(plan.id, status)
      .then(() =>
        toast.success(t('plans.statusToast', { title: plan.title, status: STATUS[status].label }), {
          action: {
            label: t('plans.undo'),
            onClick: () => void planRepo.setStatus(plan.id, previous).catch(showError),
          },
        }),
      )
      .catch(showError)
  }

  const handleDelete = () => {
    planRepo
      .remove(plan.id)
      .then(() =>
        toast.success(t('plans.deleted'), {
          action: { label: t('plans.undo'), onClick: () => void planRepo.restore(plan).catch(showError) },
        }),
      )
      .catch(showError)
  }

  const isOpen = plan.status === 'planned' || plan.status === 'in-progress'
  // First action = full swipe. Finished plans get "reset" instead of done/skip.
  const deleteAction = { id: 'delete' as const, label: t('plans.delete'), onSelect: handleDelete }
  const statusActions = isOpen
    ? [
        { id: 'done' as const, label: t('plans.markDone'), color: '#30a46c', onSelect: () => setStatus('done') },
        { id: 'skip' as const, label: t('plans.skip'), color: '#f5a524', onSelect: () => setStatus('skipped') },
      ]
    : [{ id: 'reset' as const, label: t('plans.reset'), color: '#8b8d98', onSelect: () => setStatus('planned') }]
  // Same actions back the swipe row and the ⋮ menu.
  const swipeActions = [deleteAction, ...statusActions]

  return {
    swipeActions,
    statusActions,
    deleteAction,
    statusLabel: STATUS[plan.status].label,
    statusVariant: STATUS[plan.status].variant,
    yearLabel: t('plans.yearLabel', { year: formatJalaliYear(plan.year) }),
    isFinished: !isOpen,
    menuAriaLabel: t('plans.options', { title: plan.title }),
    // One tap moves the plan forward: planned → in progress → done.
    nextStep:
      plan.status === 'planned'
        ? { kind: 'start' as const, label: t('plans.start'), onClick: () => setStatus('in-progress') }
        : plan.status === 'in-progress'
          ? { kind: 'done' as const, label: t('plans.markDone'), onClick: () => setStatus('done') }
          : null,
  }
}

export { usePlanCard }
