import { cva } from 'class-variance-authority'

const switchVariants = cva([
  'peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none',
  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'data-[size=default]:h-[26px] data-[size=default]:w-[44px]',
  'data-[size=sm]:h-3.5 data-[size=sm]:w-6',
  'data-[state=checked]:bg-primary',
  'data-[state=unchecked]:bg-input',
  'dark:data-[state=unchecked]:bg-input/80',
])

const switchThumbVariants = cva([
  'pointer-events-none block rounded-full bg-background ring-0 transition-transform shadow-[0_2px_6px_rgb(0_0_0/0.2)]',
  'group-data-[size=default]/switch:size-[22px]',
  'group-data-[size=sm]/switch:size-3',
  'data-[state=checked]:translate-x-[calc(100%-2px)]',
  'rtl:data-[state=checked]:-translate-x-[calc(100%-2px)] rtl:data-[state=unchecked]:-translate-x-0',
  'data-[state=unchecked]:translate-x-0',
  'dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground',
])

export { switchVariants, switchThumbVariants }
