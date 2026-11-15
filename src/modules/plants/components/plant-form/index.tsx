import { Droplets, ImagePlus, Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '#/components/button'
import { Field, FieldLabel } from '#/components/field'
import { usePlantForm } from '#/modules/plants/hooks/plant-form.hook'
import type { PlantFormProps } from '#/modules/plants/types'
import Image from '#/components/image'

const PlantForm = ({ initial, onSubmit }: PlantFormProps) => {
  const {
    form,
    fileId,
    image,
    analysis,
    analysisInterval,
    canAnalyze,
    isAnalyzing,
    applyAnalysis,
    dismissAnalysis,
    reanalyze,
    submitLabel,
    handleSubmit,
    removeImage,
    handleImageChange,
  } = usePlantForm({
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
              <Image src={image} alt="پیش‌نمایش عکس گیاه" className="size-20 rounded-xl object-cover" />
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute -inset-e-2 -top-2 rounded-full"
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
          {isAnalyzing && (
            <span role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden /> در حال شناسایی گیاه…
            </span>
          )}
          {canAnalyze && (
            <Button type="button" size="sm" variant="secondary" onClick={reanalyze}>
              <Sparkles /> تحلیل عکس
            </Button>
          )}
          <input id={fileId} type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
        </div>
      </Field>
      {analysis && (
        <section aria-live="polite" className="space-y-3 rounded-xl border bg-accent/40 p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-semibold">
              <Sparkles className="size-4 text-primary" aria-hidden /> {analysis.name}
            </p>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Droplets className="size-4" aria-hidden /> {analysisInterval}
            </span>
          </div>
          {analysis.care && <p className="whitespace-pre-line text-muted-foreground">{analysis.care}</p>}
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={applyAnalysis}>
              پر کردن فرم
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={dismissAnalysis}>
              نه، دستی پر می‌کنم
            </Button>
          </div>
        </section>
      )}
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
