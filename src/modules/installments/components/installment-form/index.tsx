import { Field, FieldDescription, FieldLegend, FieldSet } from '#/components/field'
import { Plus, X } from 'lucide-react'
import { Badge } from '#/components/badge'
import { Button } from '#/components/button'
import { Input } from '#/components/input'
import { useInstallmentForm } from '#/modules/installments/hooks/installment-form.hook'
import type { InstallmentFormProps } from '#/modules/installments/types'

const InstallmentForm = ({ initial, onSubmit }: InstallmentFormProps) => {
  const { form, dayOptions, getLeadOptions, getTagInput, isCreate, submitLabel, handleSubmit } = useInstallmentForm({
    initial,
    onSubmit,
  })

  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit}>
      <form.AppField name="title">{(f) => <f.TextField label="عنوان" placeholder="مثلاً وام مسکن" />}</form.AppField>
      <form.AppField name="amount">{(f) => <f.NumberField label="مبلغ هر قسط" suffix="تومان" />}</form.AppField>
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="dueDay">{(f) => <f.SelectField label="روز سررسید" options={dayOptions} />}</form.AppField>
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
      {isCreate && (
        <form.AppField name="paidPayments">
          {(f) => (
            <f.NumberField label="اقساط پرداخت‌شده تا امروز" description="اگر قبلاً بخشی از اقساط را پرداخته‌اید." />
          )}
        </form.AppField>
      )}
      <form.Field name="reminderDaysBefore">
        {(field) => (
          <FieldSet>
            <FieldLegend variant="label">زمان یادآوری</FieldLegend>
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
            <FieldDescription>اعلان در ساعت پیش‌فرض یادآوری (تنظیمات) نمایش داده می‌شود.</FieldDescription>
          </FieldSet>
        )}
      </form.Field>
      <form.Field name="tags">
        {(field) => {
          const t = getTagInput(field.state.value, field.handleChange)
          return (
            <FieldSet>
              <FieldLegend variant="label">تگ‌ها</FieldLegend>
              {t.selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {t.selected.map((x) => (
                    <Badge key={x.tag} className="gap-1 pe-1">
                      {x.tag}
                      <button type="button" aria-label={`حذف تگ ${x.tag}`} onClick={x.onRemove}>
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={t.draft}
                  placeholder="تگ جدید، مثلاً بانک ملت"
                  aria-label="تگ جدید"
                  onChange={(e) => t.handleDraftChange(e.target.value)}
                  onKeyDown={t.handleKeyDown}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="افزودن تگ"
                  disabled={!t.canAdd}
                  onClick={t.handleAdd}
                >
                  <Plus />
                </Button>
              </div>
              {t.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {t.suggestions.map((x) => (
                    <Button key={x.tag} type="button" size="sm" variant="secondary" className="h-7" onClick={x.onAdd}>
                      <Plus className="size-3" /> {x.tag}
                    </Button>
                  ))}
                </div>
              )}
              <FieldDescription>با Enter اضافه کنید یا از تگ‌های قبلی انتخاب کنید.</FieldDescription>
            </FieldSet>
          )
        }}
      </form.Field>
      <form.AppField name="isActive">
        {(f) => <f.SwitchField label="فعال" description="اقساط غیرفعال یادآوری نمی‌شوند." />}
      </form.AppField>
      <form.AppField name="notes">{(f) => <f.TextareaField label="یادداشت" placeholder="اختیاری" />}</form.AppField>
      <Field>
        <form.AppForm>
          <form.SubmitButton>{submitLabel}</form.SubmitButton>
        </form.AppForm>
      </Field>
    </form>
  )
}

export { InstallmentForm }
