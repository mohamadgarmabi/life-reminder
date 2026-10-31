import { useReminderForm } from '#/modules/reminders/hooks/reminder-form.hook'
import type { ReminderFormProps } from '#/modules/reminders/types'
import { RECURRENCE_LABEL } from '#/modules/reminders/utils/reminders.constants'

const ReminderForm = (props: ReminderFormProps) => {
  const { form, handleSubmit, isEdit, recurrenceOptions, submitLabel } = useReminderForm(props)

  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit}>
      <form.AppField name="title">{(f) => <f.TextField label="عنوان" placeholder="مثلاً تمدید بیمه" />}</form.AppField>
      <form.AppField name="description">
        {(f) => <f.TextareaField label="توضیحات" placeholder="اختیاری" />}
      </form.AppField>
      <form.AppField name="date">{(f) => <f.DateField label="تاریخ" />}</form.AppField>
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="time">{(f) => <f.TimeField label="ساعت" />}</form.AppField>
        <form.AppField name="recurrence">
          {(f) => <f.SelectField label="تکرار" options={recurrenceOptions} />}
        </form.AppField>
      </div>
      {isEdit && (
        <p className="text-xs text-muted-foreground">تغییر زمان یا تکرار، برنامهٔ یادآور را از نو شروع می‌کند.</p>
      )}
      <form.AppForm>
        <form.SubmitButton>{submitLabel}</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}

export { RECURRENCE_LABEL, ReminderForm }
