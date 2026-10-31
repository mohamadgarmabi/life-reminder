import { createFormHook } from '@tanstack/react-form'
import { CalendarIcon } from 'lucide-react'
import { WheelPicker, WheelPickerWrapper } from '@ncdai/react-wheel-picker'
import '@ncdai/react-wheel-picker/style.css'
import type { ReactNode } from 'react'
import { Button } from '#/modules/shell/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '#/modules/shell/components/ui/field'
import { Input } from '#/modules/shell/components/ui/input'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '#/modules/shell/components/ui/drawer'
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

const WHEEL_CLASSES = {
  optionItem: 'text-muted-foreground',
  // `!`: the library's unlayered CSS (font-weight: 500) beats Tailwind's layered utilities otherwise
  highlightWrapper: 'rounded-md bg-muted font-normal! text-foreground',
}

const DateField = ({ label, description }: Omit<ShellProps, 'children'>) => {
  const {
    controlProps,
    open,
    setOpen,
    year,
    month,
    day,
    dateLabel,
    yearOptions,
    monthOptions,
    dayOptions,
    handleYearChange,
    handleMonthChange,
    handleDayChange,
  } = useDateField()
  return (
    <FieldShell label={label} description={description}>
      <Button
        {...controlProps}
        type="button"
        variant="ghost"
        className="h-10 w-full justify-between rounded-lg bg-field px-3 font-normal hover:bg-field active:scale-100"
        onClick={() => setOpen(true)}
      >
        {dateLabel}
        <CalendarIcon className="text-muted-foreground" />
      </Button>
      {/* nested: the forms already live inside a drawer */}
      <Drawer nested open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{label}</DrawerTitle>
          </DrawerHeader>
          {/* data-vaul-no-drag: let the wheels scroll instead of dragging the sheet */}
          <div className="px-4 pb-8" data-vaul-no-drag>
            <WheelPickerWrapper>
              <WheelPicker
                options={dayOptions}
                value={day}
                onValueChange={handleDayChange}
                classNames={WHEEL_CLASSES}
                infinite
              />
              <WheelPicker
                options={monthOptions}
                value={month}
                onValueChange={handleMonthChange}
                classNames={WHEEL_CLASSES}
                infinite
              />
              <WheelPicker
                options={yearOptions}
                value={year}
                onValueChange={handleYearChange}
                classNames={WHEEL_CLASSES}
              />
            </WheelPickerWrapper>
          </div>
        </DrawerContent>
      </Drawer>
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
