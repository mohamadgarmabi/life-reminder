'use client'
import { GlassLayer } from '#/components/glass'

import { cn } from '#/modules/shell/utils/cn'
import { XIcon } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'

import { Button } from '#/components/button'
import {
  dialogOverlayVariants,
  dialogContentVariants,
  dialogCloseVariants,
  dialogCloseLabelVariants,
  dialogHeaderVariants,
  dialogFooterVariants,
  dialogTitleVariants,
  dialogDescriptionVariants,
} from './dialog.styles'
import type {
  DialogProps,
  DialogTriggerProps,
  DialogPortalProps,
  DialogCloseProps,
  DialogOverlayProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
} from './dialog.types'

const Dialog = ({ ...props }: DialogProps) => {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

const DialogTrigger = ({ ...props }: DialogTriggerProps) => {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

const DialogPortal = ({ ...props }: DialogPortalProps) => {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

const DialogClose = ({ ...props }: DialogCloseProps) => {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

const DialogOverlay = ({ className, ...props }: DialogOverlayProps) => {
  return (
    <DialogPrimitive.Overlay data-slot="dialog-overlay" className={cn(dialogOverlayVariants(), className)} {...props} />
  )
}

const DialogContent = ({ className, children, showCloseButton = true, ...props }: DialogContentProps) => {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content data-slot="dialog-content" className={cn(dialogContentVariants(), className)} {...props}>
        <GlassLayer radius={16} thick />
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" className={dialogCloseVariants()}>
            <XIcon />
            <span className={dialogCloseLabelVariants()}>بستن</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

const DialogHeader = ({ className, ...props }: DialogHeaderProps) => {
  return <div data-slot="dialog-header" className={cn(dialogHeaderVariants(), className)} {...props} />
}

const DialogFooter = ({ className, showCloseButton = false, children, ...props }: DialogFooterProps) => {
  return (
    <div data-slot="dialog-footer" className={cn(dialogFooterVariants(), className)} {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">بستن</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

const DialogTitle = ({ className, ...props }: DialogTitleProps) => {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn(dialogTitleVariants(), className)} {...props} />
}

const DialogDescription = ({ className, ...props }: DialogDescriptionProps) => {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(dialogDescriptionVariants(), className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
