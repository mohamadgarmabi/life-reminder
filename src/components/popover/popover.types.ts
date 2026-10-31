import type * as React from 'react'
import type { Popover as PopoverPrimitive } from 'radix-ui'

type PopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root>

type PopoverTriggerProps = React.ComponentProps<typeof PopoverPrimitive.Trigger>

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Content>

type PopoverAnchorProps = React.ComponentProps<typeof PopoverPrimitive.Anchor>

type PopoverHeaderProps = React.ComponentProps<'div'>

type PopoverTitleProps = React.ComponentProps<'h2'>

type PopoverDescriptionProps = React.ComponentProps<'p'>

export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverAnchorProps,
  PopoverHeaderProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
}
