import { cva } from 'class-variance-authority'

/** iOS Dynamic Island green, tuned to read on the black pill. No `tabular-nums`: Vazirmatn sets Persian digits in wide cells, so ۱۰ reads as ۱ ۰. */
const ACCENT = 'text-[#32d74b]'

/** Centres the pill at the top of the play area; under the shell's overlay (z-10). */
const gameIslandFrameStyles = cva('pointer-events-none absolute inset-x-0 top-2 z-5 flex justify-center px-3')

const gameIslandPillStyles = cva(
  'pointer-events-auto flex items-center overflow-hidden bg-black text-white shadow-[0_8px_24px_rgb(0_0_0/0.25)] outline-none select-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-ring dark:ring-1 dark:ring-white/15',
  {
    variants: {
      expanded: {
        false: 'h-9 min-w-36 px-3.5',
        true: 'w-full max-w-sm p-4',
      },
    },
  },
)

const gameIslandCompactStyles = cva('flex w-full items-center justify-between gap-4')

const gameIslandExpandedStyles = cva('flex w-full flex-col gap-3')

const gameIslandRowStyles = cva('flex w-full items-center gap-3')

const gameIslandIconStyles = cva('size-5 fill-current', {
  variants: { paused: { false: ACCENT, true: 'text-white/55' } },
})

const gameIslandValueStyles = cva('text-[15px] leading-5 font-semibold', {
  variants: { paused: { false: ACCENT, true: 'text-white/55' } },
})

const gameIslandTileStyles = cva('grid size-12 shrink-0 place-items-center rounded-[14px] text-white', {
  variants: { paused: { false: 'bg-[#32d74b]', true: 'bg-white/20' } },
})

const gameIslandTileIconStyles = cva('size-6 fill-current')

const gameIslandTitleStackStyles = cva('flex min-w-0 flex-1 flex-col items-center text-center')

const gameIslandTitleStyles = cva('max-w-full truncate text-[17px] leading-[22px] font-semibold')

const gameIslandSubtitleStyles = cva('max-w-full truncate text-[15px] leading-5 text-white/60')

const gameIslandBigValueStyles = cva('shrink-0 text-[34px] leading-none font-bold', {
  variants: { paused: { false: ACCENT, true: 'text-white/55' } },
})

const gameIslandRestStyles = cva('flex w-full justify-between gap-3 text-[13px] leading-4 font-medium text-white/60')

export {
  gameIslandFrameStyles,
  gameIslandPillStyles,
  gameIslandCompactStyles,
  gameIslandExpandedStyles,
  gameIslandRowStyles,
  gameIslandIconStyles,
  gameIslandValueStyles,
  gameIslandTileStyles,
  gameIslandTileIconStyles,
  gameIslandTitleStackStyles,
  gameIslandTitleStyles,
  gameIslandSubtitleStyles,
  gameIslandBigValueStyles,
  gameIslandRestStyles,
}
