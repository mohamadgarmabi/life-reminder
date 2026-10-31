import type * as React from 'react'
import type { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import type { Button } from '#/components/button'

type AlertDialogProps = React.ComponentProps<typeof AlertDialogPrimitive.Root>

type AlertDialogTriggerProps = React.ComponentProps<typeof AlertDialogPrimitive.Trigger>

type AlertDialogPortalProps = React.ComponentProps<typeof AlertDialogPrimitive.Portal>

type AlertDialogOverlayProps = React.ComponentProps<typeof AlertDialogPrimitive.Overlay>

type AlertDialogContentProps = React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: 'default' | 'sm'
}

type AlertDialogHeaderProps = React.ComponentProps<'div'>

type AlertDialogFooterProps = React.ComponentProps<'div'>

type AlertDialogTitleProps = React.ComponentProps<typeof AlertDialogPrimitive.Title>

type AlertDialogDescriptionProps = React.ComponentProps<typeof AlertDialogPrimitive.Description>

type AlertDialogMediaProps = React.ComponentProps<'div'>

type AlertDialogActionProps = React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>

type AlertDialogCancelProps = React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>

export type {
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
}
