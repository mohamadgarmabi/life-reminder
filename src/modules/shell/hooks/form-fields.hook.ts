import { createFormHookContexts } from '@tanstack/react-form'
import { getDate, getDaysInMonth, getMonth, getYear } from 'date-fns'
import {
  format as formatJalali,
  getDate as jGetDate,
  getDaysInMonth as jGetDaysInMonth,
  getMonth as jGetMonth,
  getYear as jGetYear,
  newDate as jNewDate,
} from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale/fa-IR'
import { useState, type ChangeEvent } from 'react'
import type { SelectOption } from '#/modules/shell/types'
import { parseIsoDate, toIsoDate } from '#/modules/shell/utils/dates'
import { formatDateLong, formatLocal, formatNumber, toEnDigits, toLocalDigits } from '#/modules/shell/utils/format'
import { getLanguage } from '#/modules/shell/utils/i18n'

const jalali = {
  getYear: jGetYear,
  getMonth: jGetMonth,
  getDate: jGetDate,
  getDaysInMonth: jGetDaysInMonth,
  newDate: jNewDate,
}

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))
// Persian month names, Jalali order (stored filters index into this).
const JALALI_MONTHS = Array.from({ length: 12 }, (_, m) =>
  formatJalali(jalali.newDate(1400, m, 1), 'MMMM', { locale: faIR }),
)

// The date wheel follows the display calendar: Jalali in Persian, Gregorian in English. Both emit the same ISO date.
const CALENDARS = {
  fa: jalali,
  en: { getYear, getMonth, getDate, getDaysInMonth, newDate: (y: number, m: number, d: number) => new Date(y, m, d) },
}
const range = (from: number, count: number) => Array.from({ length: count }, (_, i) => from + i)

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
    placeholder: toLocalDigits(0),
    handleChange,
  }
}

const useDateField = () => {
  const a11y = useFieldA11y<string>()
  const { field } = a11y
  const [open, setOpen] = useState(false)
  const cal = CALENDARS[getLanguage()]
  const date = parseIsoDate(field.state.value)
  const [year, month, day] = [cal.getYear(date), cal.getMonth(date), cal.getDate(date)]
  const thisYear = cal.getYear(new Date())
  const firstYear = Math.min(year, thisYear - 10)
  // clamp the day so switching to a shorter month (e.g. 31 → Mehr) stays valid
  const set = (y: number, m: number, d: number) =>
    field.handleChange(toIsoDate(cal.newDate(y, m, Math.min(d, cal.getDaysInMonth(cal.newDate(y, m, 1))))))
  return {
    ...a11y,
    open,
    setOpen,
    year,
    month,
    day,
    dateLabel: formatDateLong(field.state.value),
    yearOptions: range(firstYear, Math.max(year, thisYear + 10) - firstYear + 1).map((y) => ({
      value: y,
      label: toLocalDigits(y),
    })),
    monthOptions: range(0, 12).map((m) => ({ value: m, label: formatLocal(cal.newDate(year, m, 1), 'MMMM') })),
    dayOptions: range(1, cal.getDaysInMonth(date)).map((d) => ({ value: d, label: toLocalDigits(d) })),
    handleYearChange: (y: number) => set(y, month, day),
    handleMonthChange: (m: number) => set(year, m, day),
    handleDayChange: (d: number) => set(year, month, d),
  }
}

const useTimeSelect = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [h, m] = value.split(':')
  const minutes = MINUTES.includes(m) ? MINUTES : [...MINUTES, m].sort()
  return {
    hour: h,
    minute: m,
    hourOptions: HOURS.map((x) => ({ value: x, label: toLocalDigits(x) })),
    minuteOptions: minutes.map((x) => ({ value: x, label: toLocalDigits(x) })),
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
  JALALI_MONTHS,
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
