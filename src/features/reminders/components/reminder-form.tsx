import { revalidateLogic } from '@tanstack/react-form'
import { useSelector } from '@tanstack/react-store'
import { useAppForm } from '#/components/form/form'
import { toIsoDate, todayIso } from '#/lib/dates'
import { settingsStore } from '#/stores/settings.store'
import { reminderFormSchema, type Recurrence, type Reminder, type ReminderFormValues } from '../schema'

export const RECURRENCE_LABEL: Record<Recurrence, string> = {
  none: 'یک‌بار',
  daily: 'هر روز',
  weekly: 'هر هفته',
  monthly: 'هر ماه',
}
const RECURRENCE_OPTIONS = (Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((value) => ({
  value,
  label: RECURRENCE_LABEL[value],
}))

const pad = (n: number) => String(n).padStart(2, '0')

export function ReminderForm({ initial, onSubmit }: {
  initial?: Reminder
  onSubmit: (values: ReminderFormValues) => Promise<void>
}) {
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

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.AppField name="title">{(f) => <f.TextField label="عنوان" placeholder="مثلاً تمدید بیمه" />}</form.AppField>
      <form.AppField name="description">{(f) => <f.TextareaField label="توضیحات" placeholder="اختیاری" />}</form.AppField>
      <form.AppField name="date">{(f) => <f.DateField label="تاریخ" />}</form.AppField>
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="time">{(f) => <f.TimeField label="ساعت" />}</form.AppField>
        <form.AppField name="recurrence">
          {(f) => <f.SelectField label="تکرار" options={RECURRENCE_OPTIONS} />}
        </form.AppField>
      </div>
      {initial && (
        <p className="text-xs text-muted-foreground">تغییر زمان یا تکرار، برنامهٔ یادآور را از نو شروع می‌کند.</p>
      )}
      <form.AppForm>
        <form.SubmitButton>{initial ? 'ذخیرهٔ تغییرات' : 'افزودن یادآور'}</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
