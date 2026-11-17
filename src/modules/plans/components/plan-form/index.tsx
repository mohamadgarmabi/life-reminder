import { Field } from '#/components/field'
import { TagInput } from '#/modules/shell/components/tag-input'
import { usePlanForm } from '#/modules/plans/hooks/plan-form.hook'
import type { PlanFormProps } from '#/modules/plans/types'
import { t } from '#/modules/shell/utils/i18n'

const PlanForm = (props: PlanFormProps) => {
  const { form, knownTags, yearOptions, statusOptions, submitLabel, handleSubmit } = usePlanForm(props)

  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit}>
      <form.AppField name="title">
        {(f) => <f.TextField label={t('plans.fieldTitle')} placeholder={t('plans.titlePlaceholder')} />}
      </form.AppField>
      <form.AppField name="description">
        {(f) => <f.TextareaField label={t('plans.description')} placeholder={t('plans.descriptionPlaceholder')} />}
      </form.AppField>
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="year">
          {(f) => <f.SelectField label={t('plans.year')} options={yearOptions} />}
        </form.AppField>
        <form.AppField name="status">
          {(f) => <f.SelectField label={t('plans.status')} options={statusOptions} />}
        </form.AppField>
      </div>
      <form.Field name="tags">
        {(field) => (
          <TagInput
            value={field.state.value}
            onChange={field.handleChange}
            knownTags={knownTags}
            placeholder={t('plans.tagPlaceholder')}
          />
        )}
      </form.Field>
      <Field>
        <form.AppForm>
          <form.SubmitButton>{submitLabel}</form.SubmitButton>
        </form.AppForm>
      </Field>
    </form>
  )
}

export { PlanForm }
