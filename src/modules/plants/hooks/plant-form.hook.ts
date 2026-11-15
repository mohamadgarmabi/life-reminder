import { revalidateLogic, useField, useStore } from '@tanstack/react-form'
import type { ChangeEvent, FormEvent } from 'react'
import { useId, useState } from 'react'
import { toast } from '#/components/sonner'
import { useAppForm } from '#/modules/shell/components/form-fields'
import { todayIso } from '#/modules/shell/utils/dates'
import { toFaDigits } from '#/modules/shell/utils/format'
import { identifyPlant, isPlantAiAvailable } from '#/modules/plants/apis/plant-ai.api'
import { resizeImage } from '#/modules/plants/utils/image'
import { plantFormSchema } from '#/modules/plants/utils/plants.schema'
import type { PlantFormProps, PlantFormValues, PlantIdentify } from '#/modules/plants/types'

const usePlantForm = ({ initial, onSubmit }: PlantFormProps) => {
  const fileId = useId()
  // Every new photo is analyzed; the form changes only when the user applies the result.
  const [analysis, setAnalysis] = useState<PlantIdentify | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const form = useAppForm({
    defaultValues: {
      name: initial?.name ?? '',
      image: initial?.image ?? null,
      wateringIntervalDays: initial?.wateringIntervalDays ?? 7,
      lastWateredAt: initial?.lastWateredAt ?? todayIso(),
      notes: initial?.notes ?? '',
    } satisfies PlantFormValues as PlantFormValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: plantFormSchema },
    onSubmit: ({ value }) => onSubmit(plantFormSchema.parse(value)),
  })
  const imageField = useField({ form, name: 'image' })
  const image = useStore(imageField.store, (s) => s.value)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void form.handleSubmit()
  }
  const removeImage = () => {
    imageField.handleChange(null)
    setAnalysis(null)
  }
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    let image: string
    try {
      image = await resizeImage(file)
    } catch {
      toast.error('خواندن این تصویر ممکن نشد.')
      return
    }
    imageField.handleChange(image)
    if (isPlantAiAvailable) await analyze(image)
  }
  const analyze = async (image: string) => {
    setAnalysis(null)
    setIsAnalyzing(true)
    try {
      const result = await identifyPlant(image)
      if (result.name) setAnalysis(result)
      else toast.error('گیاهی در عکس پیدا نشد؛ فیلدها را دستی پر کنید.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تحلیل عکس ممکن نشد.')
    } finally {
      setIsAnalyzing(false)
    }
  }
  const applyAnalysis = () => {
    if (!analysis) return
    form.setFieldValue('name', analysis.name)
    form.setFieldValue('wateringIntervalDays', analysis.wateringIntervalDays)
    if (analysis.care) form.setFieldValue('notes', analysis.care)
    setAnalysis(null)
    toast.success('فرم پر شد؛ در صورت نیاز ویرایش کنید.')
  }

  return {
    form,
    fileId,
    image,
    analysis,
    analysisInterval: analysis ? `هر ${toFaDigits(analysis.wateringIntervalDays)} روز` : '',
    canAnalyze: isPlantAiAvailable && !!image && !isAnalyzing && !analysis,
    isAnalyzing,
    applyAnalysis,
    dismissAnalysis: () => setAnalysis(null),
    reanalyze: () => image && analyze(image),
    submitLabel: initial ? 'ذخیرهٔ تغییرات' : 'افزودن گیاه',
    handleSubmit,
    removeImage,
    handleImageChange,
  }
}

export { usePlantForm }
