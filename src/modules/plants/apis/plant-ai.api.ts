import { createFetch } from 'tanstack-fetch'
import { plantDiagnosisSchema, plantIdentifySchema } from '#/modules/plants/utils/plants.schema'

// Same Cloudflare worker as the push relay (push-worker/), which also hosts the free Workers AI call.
const AI_URL = import.meta.env.VITE_PUSH_URL?.replace(/\/$/, '')

const isPlantAiAvailable = !!AI_URL

const ask = async (mode: 'identify' | 'diagnose', image: string): Promise<unknown> => {
  if (!AI_URL) throw new Error('سرویس هوش مصنوعی پیکربندی نشده است.')
  try {
    return await createFetch({ baseUrl: AI_URL }).post('/plant-ai', { body: { mode, image } })
  } catch {
    throw new Error('تحلیل عکس ممکن نشد؛ اتصال اینترنت را بررسی کنید.')
  }
}

const identifyPlant = async (image: string) => plantIdentifySchema.parse(await ask('identify', image))

const diagnosePlant = async (image: string) => plantDiagnosisSchema.parse(await ask('diagnose', image))

export { isPlantAiAvailable, identifyPlant, diagnosePlant }
