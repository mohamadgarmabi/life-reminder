import { ImagePlus, X } from 'lucide-react'
import { Button } from '#/components/button'
import { Field, FieldLabel } from '#/components/field'
import { usePlantForm } from '#/modules/plants/hooks/plant-form.hook'
import type { PlantFormProps } from '#/modules/plants/types'

const PlantForm = ({ initial, onSubmit }: PlantFormProps) => {
  const { form, fileId, image, submitLabel, handleSubmit, removeImage, handleImageChange } = usePlantForm({
    initial,
    onSubmit,
  })

  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit}>
      <Field>
        <FieldLabel htmlFor={fileId}>عکس (اختیاری)</FieldLabel>
        <div className="flex items-center gap-3">
          {image && (
            <div className="relative">
              <img src={image} alt="پیش‌نمایش عکس گیاه" className="size-20 rounded-xl object-cover" />
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute -end-2 -top-2 rounded-full"
                aria-label="حذف عکس"
                onClick={removeImage}
              >
                <X />
              </Button>
            </div>
          )}
          {!image && (
            <label
              htmlFor={fileId}
              className="flex size-20 cursor-pointer items-center justify-center rounded-xl border border-dashed text-muted-foreground hover:bg-accent"
            >
              <ImagePlus aria-hidden />
            </label>
          )}
          <input id={fileId} type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
        </div>
      </Field>
      <form.AppField name="name">{(f) => <f.TextField label="نام گیاه" placeholder="مثلاً پوتوس" />}</form.AppField>
      <form.AppField name="wateringIntervalDays">
        {(f) => <f.NumberField label="فاصلهٔ آبیاری" suffix="روز" />}
      </form.AppField>
      <form.AppField name="lastWateredAt">{(f) => <f.DateField label="آخرین آبیاری" />}</form.AppField>
      <form.AppField name="notes">
        {(f) => <f.TextareaField label="یادداشت" placeholder="نور، کود، نکات نگهداری…" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>{submitLabel}</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}

export { PlantForm }
