import { revalidateLogic, useField, useStore } from '@tanstack/react-form'
import type { ChangeEvent, FormEvent } from 'react'
import { useId } from 'react'
import { toast } from 'sonner'
import { useAppForm } from '#/modules/shell/components/form-fields'
import { todayIso } from '#/modules/shell/utils/dates'
import { resizeImage } from '#/modules/plants/utils/image'
import { plantFormSchema } from '#/modules/plants/utils/plants.schema'
import type { PlantFormProps, PlantFormValues } from '#/modules/plants/types'

const usePlantForm = ({ initial, onSubmit }: PlantFormProps) => {
  const fileId = useId()
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
  const removeImage = () => imageField.handleChange(null)
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      imageField.handleChange(await resizeImage(file))
    } catch {
      toast.error('خواندن این تصویر ممکن نشد.')
    }
  }

  return {
    form,
    fileId,
    image,
    submitLabel: initial ? 'ذخیرهٔ تغییرات' : 'افزودن گیاه',
    handleSubmit,
    removeImage,
    handleImageChange,
  }
}

export { usePlantForm }
