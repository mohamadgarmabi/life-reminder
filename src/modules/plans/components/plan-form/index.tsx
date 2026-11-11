import { Field } from '#/components/field'
import { TagInput } from '#/modules/shell/components/tag-input'
import { usePlanForm } from '#/modules/plans/hooks/plan-form.hook'
import type { PlanFormProps } from '#/modules/plans/types'

const PlanForm = (props: PlanFormProps) => {
  const { form, knownTags, yearOptions, statusOptions, submitLabel, handleSubmit } = usePlanForm(props)

  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit}>
      <form.AppField name="title">
        {(f) => <f.TextField label="عنوان" placeholder="مثلاً یادگیری زبان آلمانی" />}
      </form.AppField>
      <form.AppField name="description">
        {(f) => <f.TextareaField label="توضیحات" placeholder="چه کاری، چرا و چطور؟ (اختیاری)" />}
      </form.AppField>
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="year">{(f) => <f.SelectField label="سال" options={yearOptions} />}</form.AppField>
        <form.AppField name="status">{(f) => <f.SelectField label="وضعیت" options={statusOptions} />}</form.AppField>
      </div>
      <form.Field name="tags">
        {(field) => (
          <TagInput
            value={field.state.value}
            onChange={field.handleChange}
            knownTags={knownTags}
            placeholder="تگ جدید، مثلاً سلامتی"
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
