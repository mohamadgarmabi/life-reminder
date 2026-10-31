import { z } from 'zod'
import { id, isoDate, isoDateTime, notes } from '#/lib/zod'

export const plantSchema = z.object({
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
export type Plant = z.infer<typeof plantSchema>

export const wateringSchema = z.object({
  id,
  plantId: id,
  /** Calendar day; unique per plant so double-taps don't create duplicate history. */
  date: isoDate,
  wateredAt: isoDateTime,
})
export type Watering = z.infer<typeof wateringSchema>

export const plantFormSchema = z.object({
  name: z.string().trim().min(1, 'نام گیاه را وارد کنید').max(100, 'نام طولانی است'),
  image: z.string().nullable(),
  wateringIntervalDays: z
    .number()
    .int('عدد صحیح وارد کنید')
    .min(1, 'حداقل یک روز')
    .max(365, 'حداکثر ۳۶۵ روز'),
  lastWateredAt: isoDate,
  notes: z.string().max(2000),
})
export type PlantFormValues = z.infer<typeof plantFormSchema>
