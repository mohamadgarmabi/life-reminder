import { cva } from 'class-variance-authority'

const alertDialogOverlayVariants = cva([
  'fixed inset-0 z-50 bg-black/40',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0',
])

const alertDialogContentVariants = cva([
  'group/alert-dialog-content fixed top-[50%] start-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl glass-strong p-6 duration-200',
  'rtl:-translate-x-[-50%]',
  'data-[size=sm]:max-w-xs',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  'data-[size=default]:sm:max-w-lg',
])

const alertDialogHeaderVariants = cva([
  'grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center',
  'has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6',
  'sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-start sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]',
])

const alertDialogFooterVariants = cva([
  'flex flex-col-reverse gap-2',
  'group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2',
  'sm:flex-row sm:justify-end',
])

const alertDialogTitleVariants = cva([
  'text-lg font-semibold',
  'sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2',
])

const alertDialogDescriptionVariants = cva('text-sm text-muted-foreground')

const alertDialogMediaVariants = cva([
  'mb-2 inline-flex size-16 items-center justify-center rounded-md bg-muted',
  'sm:group-data-[size=default]/alert-dialog-content:row-span-2',
  "*:[svg:not([class*='size-'])]:size-8",
])

export {
  alertDialogOverlayVariants,
  alertDialogContentVariants,
  alertDialogHeaderVariants,
  alertDialogFooterVariants,
  alertDialogTitleVariants,
  alertDialogDescriptionVariants,
  alertDialogMediaVariants,
}
