import type { Plan, PlanStatus } from '#/modules/plans/types'

/** Count per status and the share of plans that are done (0–100, rounded). */
const planReport = (plans: Plan[]) => {
  const counts: Record<PlanStatus, number> = { planned: 0, 'in-progress': 0, done: 0, skipped: 0 }
  for (const p of plans) counts[p.status]++
  const total = plans.length
  return { counts, total, percent: total ? Math.round((counts.done / total) * 100) : 0 }
}

export { planReport }
