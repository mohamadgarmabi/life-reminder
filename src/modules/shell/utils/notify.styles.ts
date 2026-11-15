import { cva } from 'class-variance-authority'

/** iOS system colours, tuned to read on the island's black. */
const notifyIconStyles = cva('shrink-0', {
  variants: {
    kind: { success: 'text-[#32d74b]', error: 'text-[#ff453a]', info: 'text-[#64d2ff]' },
    size: { compact: 'size-[22px]', expanded: 'size-9' },
  },
})

/** The message under the sensor: wraps up to three lines, centred on the island. */
const notifyMessageStyles = cva('line-clamp-3 text-[15px] leading-5 font-semibold text-center text-balance text-white')

/** A capsule action on the black island (undo), 44 pt tall for the thumb. */
const notifyActionStyles = cva(
  'h-11 shrink-0 rounded-full bg-white/15 px-4 text-[15px] font-semibold text-white outline-none active:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60',
)

export { notifyIconStyles, notifyMessageStyles, notifyActionStyles }
