import { Droplets, ImagePlus, Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '#/components/button'
import { Field, FieldLabel } from '#/components/field'
import { usePlantForm } from '#/modules/plants/hooks/plant-form.hook'
import type { PlantFormProps } from '#/modules/plants/types'
import Image from '#/components/image'
import { t } from '#/modules/shell/utils/i18n'

const PlantForm = ({ initial, onSubmit }: PlantFormProps) => {
  const {
    form,
    fileId,
    image,
    misting,
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
        <FieldLabel htmlFor={fileId}>{t('plants.photoOptional')}</FieldLabel>
        <div className="flex items-center gap-3">
          {image && (
            <div className="relative">
              <Image src={image} alt={t('plants.photoPreview')} className="size-20 rounded-xl object-cover" />
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute -inset-e-2 -top-2 rounded-full"
                aria-label={t('plants.removePhoto')}
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
              <Loader2 className="size-4 animate-spin" aria-hidden /> {t('plants.identifying')}
            </span>
          )}
          {canAnalyze && (
            <Button type="button" size="sm" variant="secondary" onClick={reanalyze}>
              <Sparkles /> {t('plants.analyzePhoto')}
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
              {t('plants.fillForm')}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={dismissAnalysis}>
              {t('plants.fillManually')}
            </Button>
          </div>
        </section>
      )}
      <form.AppField name="name">
        {(f) => <f.TextField label={t('plants.name')} placeholder={t('plants.namePlaceholder')} />}
      </form.AppField>
      <form.AppField name="wateringIntervalDays">
        {(f) => <f.NumberField label={t('plants.interval')} suffix={t('plants.days')} />}
      </form.AppField>
      <form.AppField name="lastWateredAt">{(f) => <f.DateField label={t('plants.lastWatered')} />}</form.AppField>
      <form.AppField name="misting">
        {(f) => <f.SwitchField label={t('plants.misting')} description={t('plants.mistingHint')} />}
      </form.AppField>
      {misting && (
        <>
          <form.AppField name="mistingIntervalDays">
            {(f) => <f.NumberField label={t('plants.mistingInterval')} suffix={t('plants.days')} />}
          </form.AppField>
          <form.AppField name="lastMistedAt">{(f) => <f.DateField label={t('plants.lastMisted')} />}</form.AppField>
        </>
      )}
      <form.AppField name="notes">
        {(f) => <f.TextareaField label={t('plants.notes')} placeholder={t('plants.notesPlaceholder')} />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>{submitLabel}</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}

export { PlantForm }
