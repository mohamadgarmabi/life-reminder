import { t } from '#/modules/shell/utils/i18n'
import { FieldDescription, FieldLegend, FieldSet } from '#/components/field'
import { Button } from '#/components/button'
import { TagInput } from '#/modules/shell/components/tag-input'
import { useInstallmentForm } from '#/modules/installments/hooks/installment-form.hook'
import type { InstallmentFormProps } from '#/modules/installments/types'
import { DrawerFooter } from '#/components/drawer'

const InstallmentForm = ({ initial, onSubmit }: InstallmentFormProps) => {
  const { form, dayOptions, getLeadOptions, knownTags, isCreate, submitLabel, handleSubmit } = useInstallmentForm({
    initial,
    onSubmit,
  })

  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit}>
      <form.AppField name="title">
        {(f) => (
          <f.TextField label={t('installments.form.title')} placeholder={t('installments.form.titlePlaceholder')} />
        )}
      </form.AppField>
      <form.AppField name="amount">
        {(f) => <f.NumberField label={t('installments.form.amount')} suffix={t('common.toman')} />}
      </form.AppField>
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="dueDay">
          {(f) => <f.SelectField label={t('installments.form.dueDay')} options={dayOptions} />}
        </form.AppField>
        <form.AppField name="totalPayments">
          {(f) => <f.NumberField label={t('installments.form.totalPayments')} />}
        </form.AppField>
      </div>
      <form.AppField name="startDate">
        {(f) => (
          <f.DateField label={t('installments.form.startDate')} description={t('installments.form.startDateHint')} />
        )}
      </form.AppField>
      {isCreate && (
        <form.AppField name="paidPayments">
          {(f) => (
            <f.NumberField
              label={t('installments.form.paidPayments')}
              description={t('installments.form.paidPaymentsHint')}
            />
          )}
        </form.AppField>
      )}
      <form.Field name="reminderDaysBefore">
        {(field) => (
          <FieldSet>
            <FieldLegend variant="label">{t('installments.form.reminder')}</FieldLegend>
            <div className="flex flex-wrap gap-2">
              {getLeadOptions(field.state.value, field.handleChange).map((o) => (
                <Button
                  key={o.value}
                  type="button"
                  size="sm"
                  variant={o.variant}
                  aria-pressed={o.pressed}
                  className="h-10"
                  onClick={o.onToggle}
                >
                  {o.label}
                </Button>
              ))}
            </div>
            <FieldDescription>{t('installments.form.reminderHint')}</FieldDescription>
          </FieldSet>
        )}
      </form.Field>
      <form.Field name="tags">
        {(field) => (
          <TagInput
            value={field.state.value}
            onChange={field.handleChange}
            knownTags={knownTags}
            placeholder={t('installments.form.tagPlaceholder')}
          />
        )}
      </form.Field>
      <form.AppField name="isActive">
        {(f) => <f.SwitchField label={t('installments.form.active')} description={t('installments.form.activeHint')} />}
      </form.AppField>
      <form.AppField name="notes">
        {(f) => <f.TextareaField label={t('installments.form.notes')} placeholder={t('installments.form.optional')} />}
      </form.AppField>
      <DrawerFooter>
        <form.AppForm>
          <form.SubmitButton>{submitLabel}</form.SubmitButton>
        </form.AppForm>
      </DrawerFooter>
    </form>
  )
}

export { InstallmentForm }
