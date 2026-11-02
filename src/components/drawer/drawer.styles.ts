import { cva } from 'class-variance-authority'

const drawerOverlayVariants = cva('fixed inset-0 z-50 bg-black/40')

const drawerContentVariants = cva(
  'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] max-w-lg flex-col isolate rounded-t-2xl outline-none',
)

const drawerHandleVariants = cva('mx-auto mt-2 h-1.5 w-9 shrink-0 rounded-full bg-foreground/20')

const drawerHeaderVariants = cva('flex flex-col gap-1 px-4 pt-3 pb-2 text-start')

const drawerTitleVariants = cva('text-base font-semibold')

const drawerDescriptionVariants = cva('text-sm text-muted-foreground')

export {
  drawerOverlayVariants,
  drawerContentVariants,
  drawerHandleVariants,
  drawerHeaderVariants,
  drawerTitleVariants,
  drawerDescriptionVariants,
}
