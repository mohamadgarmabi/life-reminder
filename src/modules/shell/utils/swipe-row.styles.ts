import { cva } from 'class-variance-authority'

const swipeRowStyles = cva(
  'group relative overflow-hidden h-(--sr-h) [transition:height_var(--sr-collapse)_cubic-bezier(0.23,1,0.32,1),margin-bottom_var(--sr-collapse)_cubic-bezier(0.23,1,0.32,1),opacity_var(--sr-collapse)_cubic-bezier(0.23,1,0.32,1)] data-[phase=collapsing]:mb-0! data-[phase=collapsing]:h-0! data-[phase=collapsing]:opacity-0 data-[disabled]:pointer-events-none data-[disabled]:opacity-55',
)

const swipeRowShellStyles = cva('relative overflow-hidden h-(--sr-h) rounded-(--sr-r) [background:var(--sr-row)]')

const swipeRowRailStyles = cva('absolute inset-0 [background:var(--sr-drawer)]')

const swipeRowActionStyles = cva(
  "group/action absolute top-0 grid h-full cursor-pointer touch-manipulation place-items-center border-0 p-0 [font:inherit] outline-none select-none [width:var(--sr-a)] [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] after:pointer-events-none after:absolute after:inset-0 after:bg-white after:opacity-0 after:content-[''] [@media(hover:hover)_and_(pointer:fine)]:after:[transition:opacity_150ms_ease] [@media(hover:hover)_and_(pointer:fine)]:hover:after:opacity-[0.08]",
)

const swipeRowActionLabelStyles = cva(
  'grid justify-items-center gap-1 text-[11px] leading-none font-medium tracking-[0.01em] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1)] group-active/action:scale-[0.97] motion-reduce:group-active/action:scale-100',
)

const swipeRowPrimaryBlockStyles = cva(
  'absolute top-0 h-full w-full [background:var(--sr-action)] group-data-[direction=left]:left-[calc(100%-var(--sr-a))] group-data-[direction=right]:right-[calc(100%-var(--sr-a))]',
)

const swipeRowPrimaryButtonStyles = cva(
  "group/action absolute top-0 grid h-full cursor-pointer touch-manipulation place-items-center border-0 bg-transparent p-0 [font:inherit] outline-none select-none w-(--sr-a) text-(--sr-on-action) [-webkit-touch-callout:none] no-highlight group-data-[direction=left]:left-0 group-data-[direction=right]:right-0 after:pointer-events-none after:absolute after:inset-0 after:bg-white after:opacity-0 after:content-[''] [@media(hover:hover)_and_(pointer:fine)]:after:[transition:opacity_150ms_ease] [@media(hover:hover)_and_(pointer:fine)]:hover:after:opacity-[0.08]",
)

// Content-agnostic surface: the child (a Card) brings its own padding and layout.
const swipeRowSurfaceStyles = cva(
  'relative z-1 h-full touch-pan-y [background:var(--sr-row)] text-(--sr-text) [-webkit-touch-callout:none] no-highlight [@media(hover:hover)_and_(pointer:fine)]:cursor-grab [@media(hover:hover)_and_(pointer:fine)]:group-data-dragging:cursor-grabbing pointer-coarse:select-none group-data-dragging:select-none group-data-dragging:**:select-none',
)

const swipeRowToggleStyles = cva(
  'absolute top-1/2 m-0 h-px w-px overflow-hidden border-0 bg-transparent p-0 [font:inherit] outline-none [clip-path:inset(50%)] text-(--sr-text) group-data-[direction=left]:right-3 group-data-[direction=right]:left-3 focus-visible:h-6 focus-visible:w-auto focus-visible:-translate-y-1/2 focus-visible:overflow-visible focus-visible:rounded-xl focus-visible:px-2.5 focus-visible:text-xs focus-visible:whitespace-nowrap focus-visible:[clip-path:none] focus-visible:[background:color-mix(in_srgb,var(--sr-text)_12%,transparent)]',
)

export {
  swipeRowActionLabelStyles,
  swipeRowActionStyles,
  swipeRowPrimaryBlockStyles,
  swipeRowPrimaryButtonStyles,
  swipeRowRailStyles,
  swipeRowShellStyles,
  swipeRowStyles,
  swipeRowSurfaceStyles,
  swipeRowToggleStyles,
}
