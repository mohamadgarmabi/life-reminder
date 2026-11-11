import { z } from 'zod'
import { id, isoDateTime, notes } from '#/modules/shell/utils/zod'

const PLAN_STATUSES = ['planned', 'in-progress', 'done', 'skipped'] as const

const title = z.string().trim().min(1, 'عنوان را وارد کنید').max(100, 'عنوان طولانی است')
/** Jalali year the plan belongs to. */
const year = z.number().int().min(1300).max(1500)
const status = z.enum(PLAN_STATUSES)
const tags = z.array(z.string().trim().min(1).max(30, 'تگ طولانی است')).max(20, 'حداکثر ۲۰ تگ')

const planSchema = z.object({
  id,
  title,
  description: notes,
  year,
  status,
  tags,
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
})

const planFormSchema = z.object({ title, description: z.string().max(2000), year, status, tags })

export { PLAN_STATUSES, planSchema, planFormSchema }
