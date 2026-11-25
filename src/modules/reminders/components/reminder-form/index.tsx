import { useReminderForm } from '#/modules/reminders/hooks/reminder-form.hook'
import type { ReminderFormProps } from '#/modules/reminders/types'
import { DrawerFooter } from '#/components/drawer'
import { t } from '#/modules/shell/utils/i18n'

const ReminderForm = (props: ReminderFormProps) => {
  const { form, handleSubmit, isEdit, recurrenceOptions, submitLabel } = useReminderForm(props)

  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit}>
      <form.AppField name="title">
        {(f) => <f.TextField label={t('reminders.form.title')} placeholder={t('reminders.form.titlePlaceholder')} />}
      </form.AppField>
      <form.AppField name="description">
        {(f) => <f.TextareaField label={t('reminders.form.description')} placeholder={t('reminders.form.optional')} />}
      </form.AppField>
      <form.AppField name="date">{(f) => <f.DateField label={t('reminders.form.date')} />}</form.AppField>
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="time">{(f) => <f.TimeField label={t('reminders.form.time')} />}</form.AppField>
        <form.AppField name="recurrence">
          {(f) => <f.SelectField label={t('reminders.form.recurrence')} options={recurrenceOptions} />}
        </form.AppField>
      </div>
      {isEdit && <p className="text-xs text-muted-foreground">{t('reminders.form.resetHint')}</p>}
      <DrawerFooter>
        <form.AppForm>
          <form.SubmitButton>{submitLabel}</form.SubmitButton>
        </form.AppForm>
      </DrawerFooter>
    </form>
  )
}

export { ReminderForm }
