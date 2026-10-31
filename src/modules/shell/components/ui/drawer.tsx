import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '#/modules/shell/utils/cn'

const Drawer = (props: React.ComponentProps<typeof DrawerPrimitive.Root>) => {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

const DrawerContent = ({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) => {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay data-slot="drawer-overlay" className="fixed inset-0 z-50 bg-black/40" />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] max-w-lg flex-col rounded-t-2xl bg-card shadow-[0_-8px_28px_-6px_rgb(0_0_0/0.18)] outline-none',
          className,
        )}
        {...props}
      >
        <div aria-hidden className="mx-auto mt-2 h-1.5 w-9 shrink-0 rounded-full bg-foreground/20" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  )
}

const DrawerHeader = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex flex-col gap-1 px-4 pt-3 pb-2 text-start', className)}
      {...props}
    />
  )
}

const DrawerTitle = ({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) => {
  return (
    <DrawerPrimitive.Title data-slot="drawer-title" className={cn('text-base font-semibold', className)} {...props} />
  )
}

const DrawerDescription = ({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) => {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription }
