import { z } from 'zod'
import { id, isoDate, isoDateTime, notes } from '#/modules/shell/utils/zod'

const plantSchema = z.object({
  id,
  name: z.string().trim().min(1).max(100),
  /** Downscaled JPEG data URL, so it survives JSON export/import as-is. */
  image: z.string().startsWith('data:image/').nullable(),
  wateringIntervalDays: z.number().int().min(1).max(365),
  lastWateredAt: isoDate,
  notes,
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
})

const wateringSchema = z.object({
  id,
  plantId: id,
  /** Calendar day; unique per plant so double-taps don't create duplicate history. */
  date: isoDate,
  wateredAt: isoDateTime,
})

const plantFormSchema = z.object({
  name: z.string().trim().min(1, 'نام گیاه را وارد کنید').max(100, 'نام طولانی است'),
  image: z.string().nullable(),
  wateringIntervalDays: z.number().int('عدد صحیح وارد کنید').min(1, 'حداقل یک روز').max(365, 'حداکثر ۳۶۵ روز'),
  lastWateredAt: isoDate,
  notes: z.string().max(2000),
})

// AI replies come from a model: coerce and clamp instead of trusting them.
const plantIdentifySchema = z.object({
  name: z
    .string()
    .catch('')
    .transform((s) => s.trim().slice(0, 100)),
  wateringIntervalDays: z.coerce
    .number()
    .catch(7)
    .transform((n) => Math.min(365, Math.max(1, Math.round(n)))),
  care: z
    .string()
    .catch('')
    .transform((s) => s.trim().slice(0, 2000)),
})

const plantDiagnosisSchema = z.object({
  name: z.string().catch(''),
  healthy: z.boolean().catch(false),
  summary: z.string().catch(''),
  problems: z.array(z.object({ title: z.string(), cause: z.string().catch(''), fix: z.string().catch('') })).catch([]),
})

export { plantSchema, wateringSchema, plantFormSchema, plantIdentifySchema, plantDiagnosisSchema }
