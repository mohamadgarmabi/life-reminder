import type * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import type { alertVariants } from './alert.styles'

type AlertProps = React.ComponentProps<'div'> & VariantProps<typeof alertVariants>

type AlertTitleProps = React.ComponentProps<'div'>

type AlertDescriptionProps = React.ComponentProps<'div'>

export type { AlertProps, AlertTitleProps, AlertDescriptionProps }
