import { revalidateLogic } from '@tanstack/react-form'
import { ImagePlus, X } from 'lucide-react'
import { useId } from 'react'
import { toast } from 'sonner'
import { useAppForm } from '#/components/form/form'
import { Button } from '#/components/ui/button'
import { Field, FieldLabel } from '#/components/ui/field'
import { todayIso } from '#/lib/dates'
import { resizeImage } from '../image'
import { plantFormSchema, type Plant, type PlantFormValues } from '../schema'

export function PlantForm({ initial, onSubmit }: {
  initial?: Plant
  onSubmit: (values: PlantFormValues) => Promise<void>
}) {
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

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="image">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={fileId}>عکس (اختیاری)</FieldLabel>
            <div className="flex items-center gap-3">
              {field.state.value ? (
                <div className="relative">
                  <img src={field.state.value} alt="پیش‌نمایش عکس گیاه" className="size-20 rounded-xl object-cover" />
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    className="absolute -end-2 -top-2 rounded-full"
                    aria-label="حذف عکس"
                    onClick={() => field.handleChange(null)}
                  >
                    <X />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor={fileId}
                  className="flex size-20 cursor-pointer items-center justify-center rounded-xl border border-dashed text-muted-foreground hover:bg-accent"
                >
                  <ImagePlus aria-hidden />
                </label>
              )}
              <input
                id={fileId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  try {
                    field.handleChange(await resizeImage(file))
                  } catch {
                    toast.error('خواندن این تصویر ممکن نشد.')
                  }
                }}
              />
            </div>
          </Field>
        )}
      </form.Field>
      <form.AppField name="name">{(f) => <f.TextField label="نام گیاه" placeholder="مثلاً پوتوس" />}</form.AppField>
      <form.AppField name="wateringIntervalDays">
        {(f) => <f.NumberField label="فاصلهٔ آبیاری" suffix="روز" />}
      </form.AppField>
      <form.AppField name="lastWateredAt">{(f) => <f.DateField label="آخرین آبیاری" />}</form.AppField>
      <form.AppField name="notes">
        {(f) => <f.TextareaField label="یادداشت" placeholder="نور، کود، نکات نگهداری…" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>{initial ? 'ذخیرهٔ تغییرات' : 'افزودن گیاه'}</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
