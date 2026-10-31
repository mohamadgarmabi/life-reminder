'use client'

import { cn } from '#/modules/shell/utils/cn'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'

import { Button } from '#/components/button'
import {
  alertDialogOverlayVariants,
  alertDialogContentVariants,
  alertDialogHeaderVariants,
  alertDialogFooterVariants,
  alertDialogTitleVariants,
  alertDialogDescriptionVariants,
  alertDialogMediaVariants,
} from './alert-dialog.styles'
import type {
  AlertDialogProps,
  AlertDialogTriggerProps,
  AlertDialogPortalProps,
  AlertDialogOverlayProps,
  AlertDialogContentProps,
  AlertDialogHeaderProps,
  AlertDialogFooterProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogMediaProps,
  AlertDialogActionProps,
  AlertDialogCancelProps,
} from './alert-dialog.types'

const AlertDialog = ({ ...props }: AlertDialogProps) => {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

const AlertDialogTrigger = ({ ...props }: AlertDialogTriggerProps) => {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

const AlertDialogPortal = ({ ...props }: AlertDialogPortalProps) => {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

const AlertDialogOverlay = ({ className, ...props }: AlertDialogOverlayProps) => {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(alertDialogOverlayVariants(), className)}
      {...props}
    />
  )
}

const AlertDialogContent = ({ className, size = 'default', ...props }: AlertDialogContentProps) => {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(alertDialogContentVariants(), className)}
        {...props}
      />
    </AlertDialogPortal>
  )
}

const AlertDialogHeader = ({ className, ...props }: AlertDialogHeaderProps) => {
  return <div data-slot="alert-dialog-header" className={cn(alertDialogHeaderVariants(), className)} {...props} />
}

const AlertDialogFooter = ({ className, ...props }: AlertDialogFooterProps) => {
  return <div data-slot="alert-dialog-footer" className={cn(alertDialogFooterVariants(), className)} {...props} />
}

const AlertDialogTitle = ({ className, ...props }: AlertDialogTitleProps) => {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(alertDialogTitleVariants(), className)}
      {...props}
    />
  )
}

const AlertDialogDescription = ({ className, ...props }: AlertDialogDescriptionProps) => {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(alertDialogDescriptionVariants(), className)}
      {...props}
    />
  )
}

const AlertDialogMedia = ({ className, ...props }: AlertDialogMediaProps) => {
  return <div data-slot="alert-dialog-media" className={cn(alertDialogMediaVariants(), className)} {...props} />
}

const AlertDialogAction = ({ className, variant = 'default', size = 'default', ...props }: AlertDialogActionProps) => {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={cn(className)} {...props} />
    </Button>
  )
}

const AlertDialogCancel = ({ className, variant = 'outline', size = 'default', ...props }: AlertDialogCancelProps) => {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={cn(className)} {...props} />
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogMedia,
  AlertDialogAction,
  AlertDialogCancel,
}
