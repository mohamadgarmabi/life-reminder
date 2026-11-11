import { getDb, newId, validRecords } from '#/modules/database/apis/database.api'
import { notifyDbChange } from '#/modules/database/utils/live'
import { nowIso } from '#/modules/shell/utils/dates'
import { planSchema } from '#/modules/plans/utils/plans.schema'
import type { Plan, PlanFormValues, PlanStatus } from '#/modules/plans/types'

const patch = async (id: string, changes: Partial<Plan>): Promise<Plan> => {
  const db = await getDb()
  const tx = db.transaction('plans', 'readwrite')
  const record = planSchema.parse({ ...(await tx.store.get(id)), ...changes, updatedAt: nowIso() })
  await tx.store.put(record)
  await tx.done
  notifyDbChange()
  return record
}

const planRepo = {
  list: async (): Promise<Plan[]> => {
    const db = await getDb()
    return validRecords(planSchema, await db.getAll('plans'), 'plans')
  },

  create: async (values: PlanFormValues): Promise<Plan> => {
    const now = nowIso()
    const record = planSchema.parse({
      ...values,
      id: newId(),
      description: values.description.trim() || null,
      createdAt: now,
      updatedAt: now,
    })
    await (await getDb()).add('plans', record)
    notifyDbChange()
    return record
  },

  update: (id: string, values: PlanFormValues) =>
    patch(id, { ...values, description: values.description.trim() || null }),

  setStatus: (id: string, status: PlanStatus) => patch(id, { status }),

  remove: async (id: string) => {
    await (await getDb()).delete('plans', id)
    notifyDbChange()
  },

  /** Puts a deleted plan back (undo). */
  restore: async (plan: Plan) => {
    await (await getDb()).put('plans', plan)
    notifyDbChange()
  },
}

export { planRepo }
