import { revalidateLogic } from '@tanstack/react-form'
import { useAppForm } from '#/components/form/form'
import { Field, FieldDescription, FieldLegend, FieldSet } from '#/components/ui/field'
import { Button } from '#/components/ui/button'
import { todayIso } from '#/lib/dates'
import { toFaDigits } from '#/lib/format'
import { installmentFormSchema, type Installment, type InstallmentFormValues } from '../schema'

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `${toFaDigits(i + 1)}ام هر ماه` }))
const LEAD_OPTIONS = [
  { value: 0, label: 'روز سررسید' },
  { value: 1, label: '۱ روز قبل' },
  { value: 3, label: '۳ روز قبل' },
  { value: 7, label: '۷ روز قبل' },
]

const toValues = (i: Installment): InstallmentFormValues => ({
  title: i.title,
  amount: i.amount,
  dueDay: i.dueDay,
  startDate: i.startDate,
  totalPayments: i.totalPayments,
  paidPayments: i.paidPayments,
  reminderDaysBefore: i.reminderDaysBefore,
  notes: i.notes ?? '',
  isActive: i.isActive,
})

export function InstallmentForm({ initial, onSubmit }: {
  initial?: Installment
  onSubmit: (values: InstallmentFormValues) => Promise<void>
}) {
  const form = useAppForm({
    defaultValues: initial
      ? toValues(initial)
      : {
          title: '',
          amount: 0,
          dueDay: 1,
          startDate: todayIso(),
          totalPayments: 12,
          paidPayments: 0,
          reminderDaysBefore: [0, 1],
          notes: '',
          isActive: true,
        },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: installmentFormSchema },
    onSubmit: ({ value }) => onSubmit(installmentFormSchema.parse(value)),
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
      <form.AppField name="title">{(f) => <f.TextField label="عنوان" placeholder="مثلاً وام مسکن" />}</form.AppField>
      <form.AppField name="amount">{(f) => <f.NumberField label="مبلغ هر قسط" suffix="تومان" />}</form.AppField>
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="dueDay">
          {(f) => <f.SelectField label="روز سررسید" options={DAY_OPTIONS} />}
        </form.AppField>
        <form.AppField name="totalPayments">{(f) => <f.NumberField label="تعداد کل اقساط" />}</form.AppField>
      </div>
      <form.AppField name="startDate">
        {(f) => (
          <f.DateField
            label="تاریخ شروع"
            description="اولین قسط، نخستین روز سررسید از این تاریخ به بعد است. در ماه‌های کوتاه‌تر، آخرین روز ماه در نظر گرفته می‌شود."
          />
        )}
      </form.AppField>
      {!initial && (
        <form.AppField name="paidPayments">
          {(f) => <f.NumberField label="اقساط پرداخت‌شده تا امروز" description="اگر قبلاً بخشی از اقساط را پرداخته‌اید." />}
        </form.AppField>
      )}
      <form.Field name="reminderDaysBefore">
        {(field) => (
          <FieldSet>
            <FieldLegend variant="label">زمان یادآوری</FieldLegend>
            <div className="flex flex-wrap gap-2">
              {LEAD_OPTIONS.map((o) => {
                const on = field.state.value.includes(o.value)
                return (
                  <Button
                    key={o.value}
                    type="button"
                    size="sm"
                    variant={on ? 'default' : 'outline'}
                    aria-pressed={on}
                    className="h-10"
                    onClick={() =>
                      field.handleChange(
                        on ? field.state.value.filter((v) => v !== o.value) : [...field.state.value, o.value],
                      )
                    }
                  >
                    {o.label}
                  </Button>
                )
              })}
            </div>
            <FieldDescription>اعلان در ساعت پیش‌فرض یادآوری (تنظیمات) نمایش داده می‌شود.</FieldDescription>
          </FieldSet>
        )}
      </form.Field>
      <form.AppField name="isActive">
        {(f) => <f.SwitchField label="فعال" description="اقساط غیرفعال یادآوری نمی‌شوند." />}
      </form.AppField>
      <form.AppField name="notes">{(f) => <f.TextareaField label="یادداشت" placeholder="اختیاری" />}</form.AppField>
      <Field>
        <form.AppForm>
          <form.SubmitButton>{initial ? 'ذخیرهٔ تغییرات' : 'افزودن قسط'}</form.SubmitButton>
        </form.AppForm>
      </Field>
    </form>
  )
}
