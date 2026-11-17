import { t } from '#/modules/shell/utils/i18n'
import { revalidateLogic } from '@tanstack/react-form'
import type { FormEvent } from 'react'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import { useAppForm } from '#/modules/shell/components/form-fields'
import { todayIso } from '#/modules/shell/utils/dates'
import { toLocalDigits } from '#/modules/shell/utils/format'
import { installmentFormSchema } from '#/modules/installments/utils/installments.schema'
import type { Installment, InstallmentFormProps, InstallmentFormValues } from '#/modules/installments/types'

const LEAD_OPTIONS = [
  { value: 0, label: 'installments.form.lead0' },
  { value: 1, label: 'installments.form.lead1' },
  { value: 3, label: 'installments.form.lead3' },
  { value: 7, label: 'installments.form.lead7' },
] as const

const getDayOptions = () =>
  Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: t('installments.form.dueDayOption', { n: toLocalDigits(i + 1) }),
  }))

const toValues = (i: Installment): InstallmentFormValues => ({
  title: i.title,
  amount: i.amount,
  dueDay: i.dueDay,
  startDate: i.startDate,
  totalPayments: i.totalPayments,
  paidPayments: i.paidPayments,
  reminderDaysBefore: i.reminderDaysBefore,
  tags: i.tags,
  notes: i.notes ?? '',
  isActive: i.isActive,
})

/** Lead-time toggle buttons for the current `reminderDaysBefore` field value. */
const getLeadOptions = (selected: number[], onChange: (value: number[]) => void) =>
  LEAD_OPTIONS.map((o) => {
    const on = selected.includes(o.value)
    return {
      value: o.value,
      label: t(o.label),
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
          tags: [] as string[],
          notes: '',
          isActive: true,
        },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: installmentFormSchema },
    onSubmit: ({ value }) => onSubmit(installmentFormSchema.parse(value)),
  })

  // tags from every installment, offered as suggestions
  const all = useLiveQuery(() => installmentRepo.list())
  const knownTags = [...new Set((all.data ?? []).flatMap((i) => i.tags))].sort((a, b) => a.localeCompare(b, 'fa'))
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void form.handleSubmit()
  }

  return {
    form,
    dayOptions: getDayOptions(),
    getLeadOptions,
    knownTags,
    isCreate: !initial,
    submitLabel: t(initial ? 'installments.saveChanges' : 'installments.add'),
    handleSubmit,
  }
}

export { useInstallmentForm }
