'use client'
import { GlassLayer } from '#/components/glass'

import { cn } from '#/modules/shell/utils/cn'
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import {
  dropdownMenuContentVariants,
  dropdownMenuItemVariants,
  dropdownMenuToggleItemVariants,
  dropdownMenuItemIndicatorVariants,
  dropdownMenuCheckIconVariants,
  dropdownMenuRadioIconVariants,
  dropdownMenuLabelVariants,
  dropdownMenuSeparatorVariants,
  dropdownMenuShortcutVariants,
  dropdownMenuSubTriggerVariants,
  dropdownMenuSubTriggerIconVariants,
  dropdownMenuSubContentVariants,
} from './dropdown-menu.styles'
import type {
  DropdownMenuProps,
  DropdownMenuPortalProps,
  DropdownMenuTriggerProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuLabelProps,
  DropdownMenuSeparatorProps,
  DropdownMenuShortcutProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuSubContentProps,
} from './dropdown-menu.types'

const DropdownMenu = ({ ...props }: DropdownMenuProps) => {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

const DropdownMenuPortal = ({ ...props }: DropdownMenuPortalProps) => {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

const DropdownMenuTrigger = ({ ...props }: DropdownMenuTriggerProps) => {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

const DropdownMenuContent = ({ className, sideOffset = 4, children, ...props }: DropdownMenuContentProps) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(dropdownMenuContentVariants(), className)}
        {...props}
      >
        <GlassLayer radius={16} thick />
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

const DropdownMenuGroup = ({ ...props }: DropdownMenuGroupProps) => {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

const DropdownMenuItem = ({ className, inset, variant = 'default', ...props }: DropdownMenuItemProps) => {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(dropdownMenuItemVariants(), className)}
      {...props}
    />
  )
}

const DropdownMenuCheckboxItem = ({ className, children, checked, ...props }: DropdownMenuCheckboxItemProps) => {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(dropdownMenuToggleItemVariants(), className)}
      checked={checked}
      {...props}
    >
      <span className={dropdownMenuItemIndicatorVariants()}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className={dropdownMenuCheckIconVariants()} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

const DropdownMenuRadioGroup = ({ ...props }: DropdownMenuRadioGroupProps) => {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

const DropdownMenuRadioItem = ({ className, children, ...props }: DropdownMenuRadioItemProps) => {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(dropdownMenuToggleItemVariants(), className)}
      {...props}
    >
      <span className={dropdownMenuItemIndicatorVariants()}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className={dropdownMenuRadioIconVariants()} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

const DropdownMenuLabel = ({ className, inset, ...props }: DropdownMenuLabelProps) => {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(dropdownMenuLabelVariants(), className)}
      {...props}
    />
  )
}

const DropdownMenuSeparator = ({ className, ...props }: DropdownMenuSeparatorProps) => {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(dropdownMenuSeparatorVariants(), className)}
      {...props}
    />
  )
}

const DropdownMenuShortcut = ({ className, ...props }: DropdownMenuShortcutProps) => {
  return (
    <span data-slot="dropdown-menu-shortcut" className={cn(dropdownMenuShortcutVariants(), className)} {...props} />
  )
}

const DropdownMenuSub = ({ ...props }: DropdownMenuSubProps) => {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

const DropdownMenuSubTrigger = ({ className, inset, children, ...props }: DropdownMenuSubTriggerProps) => {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(dropdownMenuSubTriggerVariants(), className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className={dropdownMenuSubTriggerIconVariants()} />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

const DropdownMenuSubContent = ({ className, children, ...props }: DropdownMenuSubContentProps) => {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(dropdownMenuSubContentVariants(), className)}
      {...props}
    >
      <GlassLayer radius={16} thick />
      {children}
    </DropdownMenuPrimitive.SubContent>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
