import { useState } from 'react'
import { getYear } from 'date-fns-jalali'
import { usePrices } from '#/modules/dashboard/hooks/prices.hook'
import { buildAgenda } from '#/modules/dashboard/utils/agenda'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import { planRepo } from '#/modules/plans/apis/plans.api'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import { reminderRepo } from '#/modules/reminders/apis/reminders.api'
import { buildAnalysisSnapshot, nearestItem } from '#/modules/settings/utils/analysis'
import { askAiText, isAiAvailable } from '#/modules/shell/apis/ai.api'
import { useNow } from '#/modules/shell/hooks/now.hook'
import { t } from '#/modules/shell/utils/i18n'

const useAnalysisCard = () => {
  const now = useNow()
  const { prices } = usePrices()
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const q = useLiveQuery(async () => {
    const [installments, plants, reminders, plans] = await Promise.all([
      installmentRepo.list(),
      plantRepo.list(),
      reminderRepo.list(),
      planRepo.list(),
    ])
    return { installments, plants, reminders, plans }
  })
  const agenda = q.data ? buildAgenda(q.data, now) : null

  const handleAnalyze = async () => {
    if (!q.data || !agenda) return
    setError(null)
    setIsAnalyzing(true)
    try {
      const data = buildAnalysisSnapshot({ ...q.data, agenda, prices, year: getYear(now) }, now)
      setText(await askAiText({ mode: 'analysis', data }))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('settings.analysis.failed'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  return {
    isAvailable: isAiAvailable,
    text,
    error,
    isAnalyzing,
    canAnalyze: !!agenda && !isAnalyzing,
    buttonLabel: t(text ? 'settings.analysis.again' : 'settings.analysis.analyze'),
    // Computed on the device, not by the model, so the link is always right.
    nearest: agenda ? nearestItem(agenda, now) : null,
    handleAnalyze: () => void handleAnalyze(),
  }
}

export { useAnalysisCard }
