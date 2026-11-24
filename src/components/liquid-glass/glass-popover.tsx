'use client'

// GlassPopover — a small surface its button unfolds into, right where the button is. The popover
// grows from the button's edge (`over="center"`: around it), thrown a little way by its own weight,
// then settled. The button lets go of its label, its glass gives way to the card and the
// content fades up and comes into focus inside, moving with the glass. The light the press let in grows with it, and its shadow goes
// along. Closing is the same motion played backwards, and the button answers it: it lights up and
// is thrown the other way as the surface comes back in (GlassPopup with `opening: 'morph'`,
// `glass-popup.tsx`).
//
//   <GlassPopover>
//     <GlassPopoverTrigger>Remind me</GlassPopoverTrigger>
//     <GlassPopoverContent>
//       <GlassPopoverTitle>Remind me</GlassPopoverTitle>
//       <GlassPopoverClose onClick={() => remind('1h')}>In an hour</GlassPopoverClose>
//       <GlassPopoverClose onClick={() => remind('tomorrow')}>Tomorrow morning</GlassPopoverClose>
//     </GlassPopoverContent>
//   </GlassPopover>
//
// UI SDK owns the behaviour (the top layer, positioning, focus, Escape, the outside press, ARIA);
// the kit's engine owns the material. Needs @ui-sdk/core and @ui-sdk/react.
// Without WebGL2 it is a plain frosted panel.

import { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger, type PopoverProps } from '@ui-sdk/react/popover'
import { useContext, type ComponentProps, type ReactNode } from 'react'

import { GlassPopupAnchor, GlassPopupContext, GlassPopupSurface, OVER_CENTER, useGlassPopup } from './glass-popup'

export type GlassPopoverProps = PopoverProps

export type GlassPopoverTriggerProps = { children?: ReactNode; className?: string } & Omit<ComponentProps<typeof PopoverTrigger>, 'children' | 'className' | 'render'>

export type GlassPopoverContentProps = {
  children?: ReactNode
  className?: string
  /**
   * Where the popover lies over its button. `edge` (default): from the button's own edge, growing
   * away from it (see `side`). `center`: around it, the button in its middle.
   */
  over?: 'center' | 'edge'
  /** With `over="edge"`: which way the popover grows from its button, down (`bottom`) or up (`top`). It flips when there is no room. */
  side?: 'top' | 'bottom'
} & Omit<ComponentProps<typeof PopoverContent>, 'children' | 'className' | 'render' | 'side' | 'inline'>

export type GlassPopoverCloseProps = {
  /** `quiet`: a soft button in the popover's own tone. `solid`: the main action. */
  variant?: 'quiet' | 'solid'
  className?: string
} & Omit<ComponentProps<typeof PopoverClose>, 'className' | 'render'>

/**
 * The popover lies over its button, whatever the button's height: UI SDK keeps that height on the
 * content (`--anchor-height`). Edge on edge, it is pulled back by all of it, from whichever side
 * it landed on. Centred, by half of it and then by half of its own height. Always with a
 * transform: UI SDK places the box as if it had none, while a margin it would take for its own
 * error and undo the moment the button moves (a hover's swell), a button's height off.
 */
const OVER = {
  center: OVER_CENTER,
  edge: 'data-[side=bottom]:[transform:translateY(calc(var(--anchor-height)*-1))] data-[side=top]:[transform:translateY(var(--anchor-height))]',
}

export function GlassPopover({ children, ...options }: GlassPopoverProps) {
  const popup = useGlassPopup({ opening: 'morph' })
  return (
    <Popover {...options}>
      <GlassPopupContext.Provider value={popup}>{children}</GlassPopupContext.Provider>
    </Popover>
  )
}

/** The button that unfolds into the popover: Select's button, in Button's glass with its light and shadow. */
export function GlassPopoverTrigger({ children, className = '', ...rest }: GlassPopoverTriggerProps) {
  const popup = useContext(GlassPopupContext)
  return (
    <PopoverTrigger
      data-glass-host=""
      className={`inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 bg-white/60 px-5 text-[15px] font-medium whitespace-nowrap text-neutral-900 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#3291FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/10 dark:text-white data-[glass-tone=dark]:text-white data-[glass-tone=light]:text-neutral-900 [&_svg]:size-4 [&_svg]:shrink-0 ${className}`}
      {...rest}
    >
      {popup && <GlassPopupAnchor popup={popup} />}
      {/* One element: the label goes as the glass leaves. */}
      <span className="inline-flex items-center gap-[inherit]">{children}</span>
    </PopoverTrigger>
  )
}

/** The popover, from its button's edge (`over="center"`: around it) and centred on it unless `align` says otherwise. Its children are yours. Pass `sideOffset` to place it yourself. */
export function GlassPopoverContent({ children, className = '', over = 'edge', side = 'bottom', align = 'center', sideOffset, ...rest }: GlassPopoverContentProps) {
  const popup = useContext(GlassPopupContext)
  return (
    <PopoverContent
      data-glass-popup=""
      data-glass-skip=""
      side={over === 'center' ? 'bottom' : side}
      align={align}
      sideOffset={sideOffset ?? 0}
      className={`group/glass w-72 max-w-[calc(100vw-1rem)] rounded-[26px] p-4 text-[15px] text-neutral-900 outline-none data-[glass-tone=dark]:text-white data-[glass-tone=light]:text-neutral-900 ${sideOffset === undefined ? OVER[over] : ''} ${className}`}
      {...rest}
    >
      {popup && <GlassPopupSurface popup={popup} />}
      {/* A group or a menu of your own inside the popover is not this popover's anchor. */}
      <GlassPopupContext.Provider value={null}>
        <div data-glass-list="" className="flex flex-col gap-3">
          {children}
        </div>
      </GlassPopupContext.Provider>
    </PopoverContent>
  )
}

/** Names the popover (an `h2`). */
export function GlassPopoverTitle({ className = '', ...rest }: { className?: string } & Omit<ComponentProps<typeof PopoverTitle>, 'className' | 'render'>) {
  return <PopoverTitle className={`px-1 text-base font-semibold tracking-tight ${className}`} {...rest} />
}

/** Says what the popover is for (a `p`). */
export function GlassPopoverDescription({ className = '', ...rest }: { className?: string } & Omit<ComponentProps<typeof PopoverDescription>, 'className' | 'render'>) {
  return <PopoverDescription className={`-mt-2 px-1 text-sm leading-relaxed opacity-70 ${className}`} {...rest} />
}

/** A button that closes the popover; `onClick` runs as it does. */
export function GlassPopoverClose({ variant = 'quiet', className = '', ...rest }: GlassPopoverCloseProps) {
  const look =
    variant === 'solid'
      ? 'bg-neutral-900 text-white hover:bg-neutral-800 group-data-[glass-tone=dark]/glass:bg-white group-data-[glass-tone=dark]/glass:text-neutral-900 group-data-[glass-tone=dark]/glass:hover:bg-neutral-200'
      : 'bg-current/10 hover:bg-current/15'
  return (
    <PopoverClose
      className={`inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold whitespace-nowrap outline-none transition-[background-color,scale] duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3291FF] active:scale-[0.97] [&_svg]:size-4 [&_svg]:shrink-0 ${look} ${className}`}
      {...rest}
    />
  )
}

export default GlassPopover
