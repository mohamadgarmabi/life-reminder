import { cva } from 'class-variance-authority'

const drawerOverlayVariants = cva('fixed inset-0 z-50 bg-black/40')

const drawerContentVariants = cva(
  'fixed inset-x-0 bottom-0 z-50 mx-auto min-w-0 max-w-lg flex-col overflow-hidden overscroll-contain bg-card outline-none',
  {
    variants: {
      size: {
        full: 'flex h-dvh max-h-dvh rounded-none',
        lg: 'flex h-[75dvh] max-h-[75dvh] rounded-t-2xl',
        md: 'flex h-[50dvh] max-h-[50dvh] rounded-t-2xl',
        sm: 'flex h-[30dvh] max-h-[30dvh] rounded-t-2xl',
        auto: 'flex h-auto max-h-dvh',
      },
    },
    defaultVariants: { size: 'auto' },
  },
)

const drawerHandleVariants = cva('mx-auto mt-2 h-1.5 w-9 shrink-0 rounded-full bg-foreground/20')

const drawerHeaderVariants = cva('flex flex-col gap-1 px-4 pt-3 pb-2 text-start')

const drawerFooterVariants = cva(
  'absolute inset-x-0 bottom-0 z-20 bg-card px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_28px_-6px_oklch(0_0_0_/_0.2)] dark:shadow-[0_-8px_28px_-6px_oklch(0_0_0_/_0.65)]',
)

const drawerTitleVariants = cva('text-base font-semibold')

const drawerDescriptionVariants = cva('text-sm text-muted-foreground')

export {
  drawerOverlayVariants,
  drawerContentVariants,
  drawerHandleVariants,
  drawerHeaderVariants,
  drawerFooterVariants,
  drawerTitleVariants,
  drawerDescriptionVariants,
}
