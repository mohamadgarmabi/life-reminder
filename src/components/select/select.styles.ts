import { cva } from 'class-variance-authority'

const selectTriggerVariants = cva([
  'flex h-10 w-fit items-center justify-between gap-2 rounded-lg border border-transparent bg-field px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none',
  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
  'dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
])

const selectValueVariants = cva('line-clamp-1')

const selectChevronVariants = cva('size-4 shrink-0 text-muted-foreground opacity-50')

const selectOptionsVariants = cva(
  'overflow-y-auto overscroll-contain px-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]',
)

const selectOptionVariants = cva([
  'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-start text-[0.9375rem] outline-none',
  'focus-visible:bg-accent',
  'active:bg-accent',
  'aria-pressed:font-semibold',
])

const selectCheckVariants = cva('size-5 shrink-0')

export {
  selectTriggerVariants,
  selectValueVariants,
  selectChevronVariants,
  selectOptionsVariants,
  selectOptionVariants,
  selectCheckVariants,
}
