import type * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from './badge.styles'

type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }

export type { BadgeProps }
