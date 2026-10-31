'use client'

import { cn } from '#/modules/shell/utils/cn'
import { Popover as PopoverPrimitive } from 'radix-ui'
import {
  popoverContentVariants,
  popoverHeaderVariants,
  popoverTitleVariants,
  popoverDescriptionVariants,
} from './popover.styles'
import type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverAnchorProps,
  PopoverHeaderProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
} from './popover.types'

const Popover = ({ ...props }: PopoverProps) => {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

const PopoverTrigger = ({ ...props }: PopoverTriggerProps) => {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

const PopoverContent = ({ className, align = 'center', sideOffset = 4, ...props }: PopoverContentProps) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(popoverContentVariants(), className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

const PopoverAnchor = ({ ...props }: PopoverAnchorProps) => {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

const PopoverHeader = ({ className, ...props }: PopoverHeaderProps) => {
  return <div data-slot="popover-header" className={cn(popoverHeaderVariants(), className)} {...props} />
}

const PopoverTitle = ({ className, ...props }: PopoverTitleProps) => {
  return <div data-slot="popover-title" className={cn(popoverTitleVariants(), className)} {...props} />
}

const PopoverDescription = ({ className, ...props }: PopoverDescriptionProps) => {
  return <p data-slot="popover-description" className={cn(popoverDescriptionVariants(), className)} {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverHeader, PopoverTitle, PopoverDescription }
