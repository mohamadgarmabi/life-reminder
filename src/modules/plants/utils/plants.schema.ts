import { z } from 'zod'
import { t } from '#/modules/shell/utils/i18n'
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
  name: z
    .string()
    .trim()
    .min(1, { error: () => t('plants.nameRequired') })
    .max(100, { error: () => t('plants.nameTooLong') }),
  image: z.string().nullable(),
  wateringIntervalDays: z
    .number()
    .int({ error: () => t('plants.integerRequired') })
    .min(1, { error: () => t('plants.minOneDay') })
    .max(365, { error: () => t('plants.max365Days') }),
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
  // Missing → true: only an explicit "not a plant" from the model rejects the photo.
  isPlant: z.boolean().catch(true),
  name: z.string().catch(''),
  healthy: z.boolean().catch(false),
  summary: z.string().catch(''),
  problems: z.array(z.object({ title: z.string(), cause: z.string().catch(''), fix: z.string().catch('') })).catch([]),
})

export { plantSchema, wateringSchema, plantFormSchema, plantIdentifySchema, plantDiagnosisSchema }
