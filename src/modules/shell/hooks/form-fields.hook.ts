import { createFormHookContexts } from '@tanstack/react-form'
import { useState, type ChangeEvent } from 'react'
import type { SelectOption } from '#/modules/shell/types'
import { parseIsoDate, toIsoDate } from '#/modules/shell/utils/dates'
import { formatDateLong, formatNumber, toEnDigits, toFaDigits } from '#/modules/shell/utils/format'

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

const toErrors = (errors: unknown[]) => {
  return errors.map((e) => {
    if (typeof e === 'string') return { message: e }
    if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string') return { message: e.message }
    return undefined
  })
}

const useFieldA11y = <T>() => {
  const field = useFieldContext<T>()
  const errors = toErrors(field.state.meta.errors)
  const invalid = errors.length > 0
  const errorId = `${field.name}-error`
  return {
    field,
    errors,
    invalid,
    errorId,
    controlProps: {
      id: field.name,
      'aria-invalid': invalid,
      'aria-describedby': invalid ? errorId : undefined,
    },
  }
}

const useTextField = () => {
  const a11y = useFieldA11y<string>()
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    a11y.field.handleChange(e.target.value)
  return { ...a11y, handleChange }
}

const useNumberField = (suffix?: string) => {
  const a11y = useFieldA11y<number>()
  const { field } = a11y
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = toEnDigits(e.target.value).replace(/\D/g, '').slice(0, 15)
    field.handleChange(digits ? Number(digits) : 0)
  }
  return {
    ...a11y,
    inputClassName: suffix ? 'pe-16' : undefined,
    displayValue: field.state.value ? formatNumber(field.state.value) : '',
    handleChange,
  }
}

const useDateField = () => {
  const a11y = useFieldA11y<string>()
  const { field } = a11y
  const [open, setOpen] = useState(false)
  const handleSelect = (d: Date | undefined) => {
    if (!d) return
    field.handleChange(toIsoDate(d))
    setOpen(false)
  }
  return {
    ...a11y,
    open,
    setOpen,
    selected: parseIsoDate(field.state.value),
    dateLabel: formatDateLong(field.state.value),
    handleSelect,
  }
}

const useTimeSelect = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [h, m] = value.split(':')
  const minutes = MINUTES.includes(m) ? MINUTES : [...MINUTES, m].sort()
  return {
    hour: h,
    minute: m,
    hourOptions: HOURS.map((x) => ({ value: x, label: toFaDigits(x) })),
    minuteOptions: minutes.map((x) => ({ value: x, label: toFaDigits(x) })),
    handleHourChange: (v: string) => onChange(`${v}:${m}`),
    handleMinuteChange: (v: string) => onChange(`${h}:${v}`),
  }
}

const useSelectField = <T extends string | number>(options: SelectOption<T>[]) => {
  const a11y = useFieldA11y<T>()
  const { field } = a11y
  const handleValueChange = (v: string) => {
    const option = options.find((o) => String(o.value) === v)
    if (option) field.handleChange(option.value)
  }
  return {
    ...a11y,
    value: String(field.state.value),
    items: options.map((o) => ({ key: String(o.value), value: String(o.value), label: o.label })),
    handleValueChange,
  }
}

const useSubmitButton = () => {
  const form = useFormContext()
  return { form, selectSubmitting: (s: { isSubmitting: boolean }) => s.isSubmitting }
}

export {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
  useFieldA11y,
  useTextField,
  useNumberField,
  useDateField,
  useTimeSelect,
  useSelectField,
  useSubmitButton,
}
