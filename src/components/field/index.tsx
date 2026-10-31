'use client'

import { cn } from '#/modules/shell/utils/cn'

import { Label } from '#/components/label'
import { Separator } from '#/components/separator'
import { useFieldError } from './field.hook'
import {
  fieldVariants,
  fieldSetVariants,
  fieldLegendVariants,
  fieldGroupVariants,
  fieldContentVariants,
  fieldLabelVariants,
  fieldTitleVariants,
  fieldDescriptionVariants,
  fieldSeparatorVariants,
  fieldSeparatorLineVariants,
  fieldSeparatorContentVariants,
  fieldErrorVariants,
  fieldErrorListVariants,
} from './field.styles'
import type {
  FieldSetProps,
  FieldLegendProps,
  FieldGroupProps,
  FieldProps,
  FieldContentProps,
  FieldLabelProps,
  FieldTitleProps,
  FieldDescriptionProps,
  FieldSeparatorProps,
  FieldErrorProps,
} from './field.types'

const FieldSet = ({ className, ...props }: FieldSetProps) => {
  return <fieldset data-slot="field-set" className={cn(fieldSetVariants(), className)} {...props} />
}

const FieldLegend = ({ className, variant = 'legend', ...props }: FieldLegendProps) => {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(fieldLegendVariants(), className)}
      {...props}
    />
  )
}

const FieldGroup = ({ className, ...props }: FieldGroupProps) => {
  return <div data-slot="field-group" className={cn(fieldGroupVariants(), className)} {...props} />
}

const Field = ({ className, orientation = 'vertical', ...props }: FieldProps) => {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

const FieldContent = ({ className, ...props }: FieldContentProps) => {
  return <div data-slot="field-content" className={cn(fieldContentVariants(), className)} {...props} />
}

const FieldLabel = ({ className, ...props }: FieldLabelProps) => {
  return <Label data-slot="field-label" className={cn(fieldLabelVariants(), className)} {...props} />
}

const FieldTitle = ({ className, ...props }: FieldTitleProps) => {
  return <div data-slot="field-label" className={cn(fieldTitleVariants(), className)} {...props} />
}

const FieldDescription = ({ className, ...props }: FieldDescriptionProps) => {
  return <p data-slot="field-description" className={cn(fieldDescriptionVariants(), className)} {...props} />
}

const FieldSeparator = ({ children, className, ...props }: FieldSeparatorProps) => {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(fieldSeparatorVariants(), className)}
      {...props}
    >
      <Separator className={fieldSeparatorLineVariants()} />
      {children && (
        <span className={fieldSeparatorContentVariants()} data-slot="field-separator-content">
          {children}
        </span>
      )}
    </div>
  )
}

const FieldError = ({ className, children, errors, ...props }: FieldErrorProps) => {
  const { customContent, singleMessage, showList, listItems, isHidden } = useFieldError({ children, errors })

  if (isHidden) {
    return null
  }

  return (
    <div role="alert" data-slot="field-error" className={cn(fieldErrorVariants(), className)} {...props}>
      {customContent}
      {singleMessage}
      {showList && (
        <ul className={fieldErrorListVariants()}>
          {listItems.map((item) => (
            <li key={item.key}>{item.message}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldSeparator,
  FieldError,
}
