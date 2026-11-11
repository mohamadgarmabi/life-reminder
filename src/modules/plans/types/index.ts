import type { z } from 'zod'
import type { PLAN_STATUSES, planFormSchema, planSchema } from '#/modules/plans/utils/plans.schema'

type Plan = z.infer<typeof planSchema>

type PlanStatus = (typeof PLAN_STATUSES)[number]

type PlanFormValues = z.infer<typeof planFormSchema>

type PlanCardProps = {
  plan: Plan
  onEdit: () => void
}

type PlanFormProps = {
  initial?: Plan
  defaultYear: number
  onSubmit: (values: PlanFormValues) => Promise<void>
}

type PlansDialog = { type: 'create' } | { type: 'edit'; item: Plan } | null

export type { Plan, PlanStatus, PlanFormValues, PlanCardProps, PlanFormProps, PlansDialog }
