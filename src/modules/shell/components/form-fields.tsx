import { createFormHook } from '@tanstack/react-form'
import { CalendarIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '#/modules/shell/components/ui/button'
import { Calendar } from '#/modules/shell/components/ui/calendar'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '#/modules/shell/components/ui/field'
import { Input } from '#/modules/shell/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '#/modules/shell/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/modules/shell/components/ui/select'
import { Switch } from '#/modules/shell/components/ui/switch'
import { Textarea } from '#/modules/shell/components/ui/textarea'
import {
  fieldContext,
  formContext,
  useDateField,
  useFieldA11y,
  useNumberField,
  useSelectField,
  useSubmitButton,
  useTextField,
  useTimeSelect,
} from '#/modules/shell/hooks/form-fields.hook'
import type { SelectOption } from '#/modules/shell/types'

interface ShellProps {
  label: string
  description?: string
  children: ReactNode
}

const FieldShell = ({ label, description, children }: ShellProps) => {
  const { field, errors, invalid, errorId } = useFieldA11y<unknown>()
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError id={errorId} errors={errors} />
    </Field>
  )
}

const TextField = ({ label, description, placeholder }: Omit<ShellProps, 'children'> & { placeholder?: string }) => {
  const { field, controlProps, handleChange } = useTextField()
  return (
    <FieldShell label={label} description={description}>
      <Input
        {...controlProps}
        name={field.name}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={handleChange}
      />
    </FieldShell>
  )
}

const TextareaField = ({
  label,
  description,
  placeholder,
}: Omit<ShellProps, 'children'> & { placeholder?: string }) => {
  const { field, controlProps, handleChange } = useTextField()
  return (
    <FieldShell label={label} description={description}>
      <Textarea
        {...controlProps}
        name={field.name}
        value={field.state.value}
        placeholder={placeholder}
        rows={3}
        onBlur={field.handleBlur}
        onChange={handleChange}
      />
    </FieldShell>
  )
}

const NumberField = ({ label, description, suffix }: Omit<ShellProps, 'children'> & { suffix?: string }) => {
  const { field, controlProps, inputClassName, displayValue, handleChange } = useNumberField(suffix)
  return (
    <FieldShell label={label} description={description}>
      <div className="relative">
        <Input
          {...controlProps}
          name={field.name}
          inputMode="numeric"
          autoComplete="off"
          placeholder="۰"
          className={inputClassName}
          value={displayValue}
          onBlur={field.handleBlur}
          onChange={handleChange}
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

const DateField = ({ label, description }: Omit<ShellProps, 'children'>) => {
  const { controlProps, open, setOpen, selected, dateLabel, handleSelect } = useDateField()
  return (
    <FieldShell label={label} description={description}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            {...controlProps}
            type="button"
            variant="ghost"
            className="h-10 w-full justify-between rounded-lg bg-field px-3 font-normal hover:bg-field active:scale-100"
          >
            {dateLabel}
            <CalendarIcon className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={selected} defaultMonth={selected} onSelect={handleSelect} />
        </PopoverContent>
      </Popover>
    </FieldShell>
  )
}

const TimeSelect = ({
  value,
  onChange,
  id,
  invalid,
}: {
  value: string
  onChange: (value: string) => void
  id?: string
  invalid?: boolean
}) => {
  const { hour, minute, hourOptions, minuteOptions, handleHourChange, handleMinuteChange } = useTimeSelect({
    value,
    onChange,
  })
  return (
    <div className="flex items-center gap-2" dir="ltr">
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger id={id} aria-invalid={invalid} className="w-full" aria-label="ساعت">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map((x) => (
            <SelectItem key={x.value} value={x.value}>
              {x.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span aria-hidden>:</span>
      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-full" aria-label="دقیقه">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((x) => (
            <SelectItem key={x.value} value={x.value}>
              {x.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

const TimeField = ({ label, description }: Omit<ShellProps, 'children'>) => {
  const { field, invalid } = useFieldA11y<string>()
  return (
    <FieldShell label={label} description={description}>
      <TimeSelect id={field.name} invalid={invalid} value={field.state.value} onChange={field.handleChange} />
    </FieldShell>
  )
}

const SelectField = <T extends string | number>({
  label,
  description,
  options,
}: Omit<ShellProps, 'children'> & { options: SelectOption<T>[] }) => {
  const { controlProps, value, items, handleValueChange } = useSelectField(options)
  return (
    <FieldShell label={label} description={description}>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger {...controlProps} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((o) => (
            <SelectItem key={o.key} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  )
}

const SwitchField = ({ label, description }: Omit<ShellProps, 'children'>) => {
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

const SubmitButton = ({ children }: { children: ReactNode }) => {
  const { form, selectSubmitting } = useSubmitButton()
  return (
    <form.Subscribe selector={selectSubmitting}>
      {(submitting) => (
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {children}
        </Button>
      )}
    </form.Subscribe>
  )
}

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextareaField, NumberField, DateField, TimeField, SelectField, SwitchField },
  formComponents: { SubmitButton },
})

export { TimeSelect, useAppForm }
