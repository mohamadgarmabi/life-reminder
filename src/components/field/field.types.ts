import type { VariantProps } from 'class-variance-authority'
import type { Label } from '#/components/label'
import type { fieldVariants } from './field.styles'

type FieldSetProps = React.ComponentProps<'fieldset'>

type FieldLegendProps = React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }

type FieldGroupProps = React.ComponentProps<'div'>

type FieldProps = React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>

type FieldContentProps = React.ComponentProps<'div'>

type FieldLabelProps = React.ComponentProps<typeof Label>

type FieldTitleProps = React.ComponentProps<'div'>

type FieldDescriptionProps = React.ComponentProps<'p'>

type FieldSeparatorProps = React.ComponentProps<'div'> & {
  children?: React.ReactNode
}

type FieldErrorProps = React.ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>
}

type UseFieldErrorParams = Pick<FieldErrorProps, 'children' | 'errors'>

export type {
  UseFieldErrorParams,
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
}
