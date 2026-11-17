import type { FormEvent } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { useSelector } from '@tanstack/react-store'
import { useAppForm } from '#/modules/shell/components/form-fields'
import { toIsoDate, todayIso } from '#/modules/shell/utils/dates'
import { settingsStore } from '#/modules/settings/stores/settings.store'
import { reminderFormSchema } from '#/modules/reminders/utils/reminders.schema'
import { t } from '#/modules/shell/utils/i18n'
import { RECURRENCE_LABEL } from '#/modules/reminders/utils/reminders.constants'
import type { Recurrence, ReminderFormProps, ReminderFormValues } from '#/modules/reminders/types'

const pad = (n: number) => String(n).padStart(2, '0')

const useReminderForm = ({ initial, onSubmit }: ReminderFormProps) => {
  const defaultTime = useSelector(settingsStore, (s) => s.defaultReminderTime)
  const at = initial ? new Date(initial.scheduledAt) : null
  const form = useAppForm({
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      date: at ? toIsoDate(at) : todayIso(),
      time: at ? `${pad(at.getHours())}:${pad(at.getMinutes())}` : defaultTime,
      recurrence: initial?.recurrence ?? 'none',
    } satisfies ReminderFormValues as ReminderFormValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: reminderFormSchema },
    onSubmit: ({ value }) => onSubmit(reminderFormSchema.parse(value)),
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void form.handleSubmit()
  }

  return {
    form,
    handleSubmit,
    isEdit: !!initial,
    recurrenceOptions: (Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((value) => ({
      value,
      label: t(RECURRENCE_LABEL[value]),
    })),
    submitLabel: t(initial ? 'reminders.form.save' : 'reminders.form.add'),
  }
}

export { useReminderForm }
