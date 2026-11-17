import { CircleCheck, TriangleAlert } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useId, useState } from 'react'
import { diagnosePlant } from '#/modules/plants/apis/plant-ai.api'
import type { PlantDiagnosis } from '#/modules/plants/types'
import { resizeImage } from '#/modules/plants/utils/image'
import { t } from '#/modules/shell/utils/i18n'

const usePlantDoctor = () => {
  const fileId = useId()
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<PlantDiagnosis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setResult(null)
    setError(null)
    setIsAnalyzing(true)
    try {
      const resized = await resizeImage(file)
      setImage(resized)
      const diagnosis = await diagnosePlant(resized)
      if (!diagnosis.isPlant) throw new Error(t('plants.notAPlant'))
      setResult(diagnosis)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('plants.analyzeFailed'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  return {
    fileId,
    image,
    result,
    error,
    isAnalyzing,
    handleImageChange,
    uploadHint: image ? t('plants.doctorPickAnother') : t('plants.doctorHint'),
    StatusIcon: result?.healthy ? CircleCheck : TriangleAlert,
    statusTitle: result
      ? t('plants.statusTitle', {
          name: result.name || t('plants.plant'),
          status: result.healthy ? t('plants.healthy') : t('plants.needsCare'),
        })
      : '',
  }
}

export { usePlantDoctor }
