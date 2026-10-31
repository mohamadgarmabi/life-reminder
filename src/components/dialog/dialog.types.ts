import type * as React from 'react'
import type { Dialog as DialogPrimitive } from 'radix-ui'

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>

type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>

type DialogPortalProps = React.ComponentProps<typeof DialogPrimitive.Portal>

type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>

type DialogOverlayProps = React.ComponentProps<typeof DialogPrimitive.Overlay>

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}

type DialogHeaderProps = React.ComponentProps<'div'>

type DialogFooterProps = React.ComponentProps<'div'> & {
  showCloseButton?: boolean
}

type DialogTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>

type DialogDescriptionProps = React.ComponentProps<typeof DialogPrimitive.Description>

export type {
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
}
