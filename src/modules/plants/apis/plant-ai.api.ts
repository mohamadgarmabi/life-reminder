import { createFetch } from 'tanstack-fetch'
import { AI_URL, isAiAvailable } from '#/modules/shell/apis/ai.api'
import { getLanguage, t } from '#/modules/shell/utils/i18n'
import { plantDiagnosisSchema, plantIdentifySchema } from '#/modules/plants/utils/plants.schema'

const isPlantAiAvailable = isAiAvailable

const ask = async (mode: 'identify' | 'diagnose', image: string): Promise<unknown> => {
  if (!AI_URL) throw new Error(t('plants.aiNotConfigured'))
  try {
    return await createFetch({ baseUrl: AI_URL }).post('/plant-ai', { body: { mode, image, lang: getLanguage() } })
  } catch {
    throw new Error(t('plants.analyzeNetwork'))
  }
}

const identifyPlant = async (image: string) => plantIdentifySchema.parse(await ask('identify', image))

const diagnosePlant = async (image: string) => plantDiagnosisSchema.parse(await ask('diagnose', image))

export { isPlantAiAvailable, identifyPlant, diagnosePlant }
