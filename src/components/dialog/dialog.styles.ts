import { cva } from 'class-variance-authority'

const dialogOverlayVariants = cva([
  'fixed inset-0 z-50 bg-black/40',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0',
])

const dialogContentVariants = cva([
  'fixed top-[50%] inset-s-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl glass-strong p-6 duration-200 outline-none',
  'rtl:-translate-x-[-50%]',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  'sm:max-w-lg',
])

const dialogCloseVariants = cva([
  'absolute top-4 inset-e-4 flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform outline-none',
  'after:absolute after:-inset-1',
  'focus-visible:ring-[3px] focus-visible:ring-ring/50',
  'active:scale-90',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  "[&_svg:not([class*='size-'])]:size-4",
])

const dialogCloseLabelVariants = cva('sr-only')

const dialogHeaderVariants = cva('flex flex-col gap-2 text-center sm:text-start')

const dialogFooterVariants = cva('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end')

const dialogTitleVariants = cva('text-lg leading-none font-semibold')

const dialogDescriptionVariants = cva('text-sm text-muted-foreground')

export {
  dialogOverlayVariants,
  dialogContentVariants,
  dialogCloseVariants,
  dialogCloseLabelVariants,
  dialogHeaderVariants,
  dialogFooterVariants,
  dialogTitleVariants,
  dialogDescriptionVariants,
}
