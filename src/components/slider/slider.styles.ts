import { cva } from 'class-variance-authority'

const sliderVariants = cva(
  'relative flex h-11 w-full touch-none items-center select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
)

const sliderTrackVariants = cva('relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20')

const sliderRangeVariants = cva('absolute h-full bg-primary')

// The visible thumb is 22px; the ::before extends the hit area to 44px for touch.
const sliderThumbVariants = cva([
  'relative block size-[22px] rounded-full bg-background shadow-[0_2px_6px_rgb(0_0_0/0.25)] ring-1 ring-black/5 transition-transform outline-none',
  'before:absolute before:-inset-[11px] before:content-[""]',
  'focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-110',
])

export { sliderVariants, sliderTrackVariants, sliderRangeVariants, sliderThumbVariants }
