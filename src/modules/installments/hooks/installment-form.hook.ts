import { revalidateLogic } from '@tanstack/react-form'
import type { FormEvent } from 'react'
import { useAppForm } from '#/modules/shell/components/form-fields'
import { todayIso } from '#/modules/shell/utils/dates'
import { toFaDigits } from '#/modules/shell/utils/format'
import { installmentFormSchema } from '#/modules/installments/utils/installments.schema'
import type { Installment, InstallmentFormProps, InstallmentFormValues } from '#/modules/installments/types'

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

/** Lead-time toggle buttons for the current `reminderDaysBefore` field value. */
const getLeadOptions = (selected: number[], onChange: (value: number[]) => void) =>
  LEAD_OPTIONS.map((o) => {
    const on = selected.includes(o.value)
    return {
      ...o,
      pressed: on,
      variant: on ? ('default' as const) : ('outline' as const),
      onToggle: () => onChange(on ? selected.filter((v) => v !== o.value) : [...selected, o.value]),
    }
  })

const useInstallmentForm = ({ initial, onSubmit }: InstallmentFormProps) => {
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void form.handleSubmit()
  }

  return {
    form,
    dayOptions: DAY_OPTIONS,
    getLeadOptions,
    isCreate: !initial,
    submitLabel: initial ? 'ذخیرهٔ تغییرات' : 'افزودن قسط',
    handleSubmit,
  }
}

export { useInstallmentForm }
