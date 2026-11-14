import { Drawer as DrawerPrimitive } from 'vaul'
import { GlassLayer } from '#/components/glass'
import { cn } from '#/modules/shell/utils/cn'
import {
  drawerOverlayVariants,
  drawerContentVariants,
  drawerHandleVariants,
  drawerHeaderVariants,
  drawerTitleVariants,
  drawerDescriptionVariants,
} from './drawer.styles'
import type {
  DrawerProps,
  DrawerContentProps,
  DrawerHeaderProps,
  DrawerTitleProps,
  DrawerDescriptionProps,
} from './drawer.types'

const Drawer = (props: DrawerProps) => {
  // disablePreventScroll={false} turns vaul's iOS scroll-prevention OFF (the prop reads backwards).
  // That code does `window.scrollTo(0, 0)` on open and scrolls back on close; react-aria compensates with a
  // negative body margin, but vaul dropped it and leans on its own `position: fixed` body instead — which it
  // skips in an installed PWA. So on a long list the page snapped to the top for as long as a sheet was open.
  // The sheet still locks the page: `position: fixed` in Safari, Radix's `overflow: hidden` elsewhere.
  return <DrawerPrimitive.Root data-slot="drawer" disablePreventScroll={false} {...props} />
}

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerContent = ({ className, children, ...props }: DrawerContentProps) => {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay data-slot="drawer-overlay" className={drawerOverlayVariants()} />
      <DrawerPrimitive.Content data-slot="drawer-content" className={cn(drawerContentVariants(), className)} {...props}>
        <GlassLayer radius={16} thick />
        <div aria-hidden className={drawerHandleVariants()} />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  )
}

const DrawerHeader = ({ className, ...props }: DrawerHeaderProps) => {
  return <div data-slot="drawer-header" className={cn(drawerHeaderVariants(), className)} {...props} />
}

const DrawerTitle = ({ className, ...props }: DrawerTitleProps) => {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn(drawerTitleVariants(), className)} {...props} />
}

const DrawerDescription = ({ className, ...props }: DrawerDescriptionProps) => {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn(drawerDescriptionVariants(), className)}
      {...props}
    />
  )
}

export { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription }
