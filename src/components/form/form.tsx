import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { CalendarIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Switch } from '#/components/ui/switch'
import { Textarea } from '#/components/ui/textarea'
import { parseIsoDate, toIsoDate } from '#/lib/dates'
import { formatDateLong, formatNumber, toEnDigits, toFaDigits } from '#/lib/format'

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

/** Schema issues arrive as objects with `message`; normalise anything else defensively. */
function toErrors(errors: unknown[]) {
  return errors.map((e) => {
    if (typeof e === 'string') return { message: e }
    if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string') return { message: e.message }
    return undefined
  })
}

function useFieldA11y<T>() {
  const field = useFieldContext<T>()
  const errors = toErrors(field.state.meta.errors)
  const invalid = errors.length > 0
  return {
    field,
    errors,
    invalid,
    controlProps: {
      id: field.name,
      'aria-invalid': invalid,
      'aria-describedby': invalid ? `${field.name}-error` : undefined,
    },
  }
}

interface ShellProps {
  label: string
  description?: string
  children: ReactNode
}

function FieldShell({ label, description, children }: ShellProps) {
  const { field, errors, invalid } = useFieldA11y<unknown>()
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError id={`${field.name}-error`} errors={errors} />
    </Field>
  )
}

function TextField({ label, description, placeholder }: Omit<ShellProps, 'children'> & { placeholder?: string }) {
  const { field, controlProps } = useFieldA11y<string>()
  return (
    <FieldShell label={label} description={description}>
      <Input
        {...controlProps}
        name={field.name}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </FieldShell>
  )
}

function TextareaField({ label, description, placeholder }: Omit<ShellProps, 'children'> & { placeholder?: string }) {
  const { field, controlProps } = useFieldA11y<string>()
  return (
    <FieldShell label={label} description={description}>
      <Textarea
        {...controlProps}
        name={field.name}
        value={field.state.value}
        placeholder={placeholder}
        rows={3}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </FieldShell>
  )
}

/** Accepts Persian, Arabic or Latin digits; shows grouped Persian digits; stores a number. */
function NumberField({ label, description, suffix }: Omit<ShellProps, 'children'> & { suffix?: string }) {
  const { field, controlProps } = useFieldA11y<number>()
  return (
    <FieldShell label={label} description={description}>
      <div className="relative">
        <Input
          {...controlProps}
          name={field.name}
          inputMode="numeric"
          autoComplete="off"
          placeholder="۰"
          className={suffix ? 'pe-16' : undefined}
          value={field.state.value ? formatNumber(field.state.value) : ''}
          onBlur={field.handleBlur}
          onChange={(e) => {
            const digits = toEnDigits(e.target.value).replace(/\D/g, '').slice(0, 15)
            field.handleChange(digits ? Number(digits) : 0)
          }}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </FieldShell>
  )
}

/** Jalali date picker; value is a Gregorian "YYYY-MM-DD" string. */
function DateField({ label, description }: Omit<ShellProps, 'children'>) {
  const { field, controlProps } = useFieldA11y<string>()
  const [open, setOpen] = useState(false)
  const selected = parseIsoDate(field.state.value)
  return (
    <FieldShell label={label} description={description}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button {...controlProps} type="button" variant="ghost" className="h-10 w-full justify-between rounded-lg bg-field px-3 font-normal hover:bg-field active:scale-100">
            {formatDateLong(field.state.value)}
            <CalendarIcon className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(d) => {
              if (!d) return
              field.handleChange(toIsoDate(d))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </FieldShell>
  )
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

/** "HH:mm" via two selects so digits stay Persian regardless of the OS time picker. */
export function TimeSelect({ value, onChange, id, invalid }: {
  value: string
  onChange: (value: string) => void
  id?: string
  invalid?: boolean
}) {
  const [h, m] = value.split(':')
  const minutes = MINUTES.includes(m) ? MINUTES : [...MINUTES, m].sort()
  return (
    <div className="flex items-center gap-2" dir="ltr">
      <Select value={h} onValueChange={(v) => onChange(`${v}:${m}`)}>
        <SelectTrigger id={id} aria-invalid={invalid} className="w-full" aria-label="ساعت">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((x) => (
            <SelectItem key={x} value={x}>{toFaDigits(x)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span aria-hidden>:</span>
      <Select value={m} onValueChange={(v) => onChange(`${h}:${v}`)}>
        <SelectTrigger className="w-full" aria-label="دقیقه">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((x) => (
            <SelectItem key={x} value={x}>{toFaDigits(x)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function TimeField({ label, description }: Omit<ShellProps, 'children'>) {
  const { field, invalid } = useFieldA11y<string>()
  return (
    <FieldShell label={label} description={description}>
      <TimeSelect id={field.name} invalid={invalid} value={field.state.value} onChange={field.handleChange} />
    </FieldShell>
  )
}

interface Option<T> {
  value: T
  label: string
}

function SelectField<T extends string | number>({
  label,
  description,
  options,
}: Omit<ShellProps, 'children'> & { options: Option<T>[] }) {
  const { field, controlProps } = useFieldA11y<T>()
  return (
    <FieldShell label={label} description={description}>
      <Select
        value={String(field.state.value)}
        onValueChange={(v) => {
          const option = options.find((o) => String(o.value) === v)
          if (option) field.handleChange(option.value)
        }}
      >
        <SelectTrigger {...controlProps} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={String(o.value)} value={String(o.value)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  )
}

function SwitchField({ label, description }: Omit<ShellProps, 'children'>) {
  const { field } = useFieldA11y<boolean>()
  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Switch id={field.name} checked={field.state.value} onCheckedChange={field.handleChange} />
    </Field>
  )
}

function SubmitButton({ children }: { children: ReactNode }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(s) => s.isSubmitting}>
      {(submitting) => (
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {children}
        </Button>
      )}
    </form.Subscribe>
  )
}

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextareaField, NumberField, DateField, TimeField, SelectField, SwitchField },
  formComponents: { SubmitButton },
})

