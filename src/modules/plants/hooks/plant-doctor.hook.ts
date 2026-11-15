import { CircleCheck, TriangleAlert } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useId, useState } from 'react'
import { diagnosePlant } from '#/modules/plants/apis/plant-ai.api'
import type { PlantDiagnosis } from '#/modules/plants/types'
import { resizeImage } from '#/modules/plants/utils/image'

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
      setResult(await diagnosePlant(resized))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تحلیل عکس ممکن نشد.')
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
    uploadHint: image ? 'عکس دیگری انتخاب کنید' : 'از برگ‌ها یا بخش آسیب‌دیده عکس واضح بگیرید',
    StatusIcon: result?.healthy ? CircleCheck : TriangleAlert,
    statusTitle: result
      ? `${result.name || 'گیاه'} — ${result.healthy ? 'سالم به نظر می‌رسد' : 'نیاز به رسیدگی دارد'}`
      : '',
  }
}

export { usePlantDoctor }
