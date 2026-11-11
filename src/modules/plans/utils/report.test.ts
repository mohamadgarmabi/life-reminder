import { describe, expect, it } from 'vitest'
import { planReport } from '#/modules/plans/utils/report'
import type { Plan, PlanStatus } from '#/modules/plans/types'

const plan = (status: PlanStatus) => ({ status }) as Plan

describe('planReport', () => {
  it('is 0% with no plans', () => {
    expect(planReport([])).toMatchObject({ total: 0, percent: 0 })
  })

  it('counts each status and rounds the done share', () => {
    const r = planReport([
      plan('done'),
      plan('planned'),
      plan('in-progress'),
      plan('skipped'),
      plan('done'),
      plan('done'),
    ])
    expect(r.counts).toEqual({ planned: 1, 'in-progress': 1, done: 3, skipped: 1 })
    expect(r.percent).toBe(50)
    expect(planReport([plan('done'), plan('planned'), plan('planned')]).percent).toBe(33)
  })
})
