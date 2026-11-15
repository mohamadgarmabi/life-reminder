import { createElement, type CSSProperties, type ReactNode } from 'react'
import type { IslandLayerProps, SlotName } from '#/modules/shell/types/island'
import { islandSlotBase } from '#/modules/shell/utils/island-layer.styles'

/**
 * Text that outgrows a compact slot ends in an ellipsis instead of being cut by the pill's edge.
 * Other content is clipped at the slot's width (`metrics.compact.maxSlotWidth`).
 */
const fitText = (children: ReactNode, maxWidth: number) =>
  typeof children === 'string' || typeof children === 'number'
    ? createElement(
        'span',
        { style: { display: 'block', maxWidth, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
        children,
      )
    : children

/** One content layer: the slots of its presentation, which the frame loop positions. */
const useIslandLayer = ({ layerKey, presentation, register, metrics, expandedWidth, leaving }: IslandLayerProps) => {
  const slotRef = (name: SlotName) => (element: HTMLElement | null) => register(layerKey, name, element)
  const registerSlot = (name: SlotName, element: HTMLElement | null) => register(layerKey, name, element)
  const max = metrics.compact.maxSlotWidth
  const compact = presentation.kind === 'compact' ? presentation : null
  const minimal = presentation.kind === 'minimal' ? presentation : null
  const expanded = presentation.kind === 'expanded' ? presentation : null
  const split = minimal?.split ?? null

  return {
    rootRef: slotRef('root'),
    kind: presentation.kind,
    // Leaving layers are hidden from assistive tech and can't take focus.
    rootHidden: leaving || undefined,
    rootInert: leaving,
    rootStyle: {
      position: 'absolute',
      inset: 0,
      pointerEvents: expanded && !leaving ? 'auto' : 'none',
    } satisfies CSSProperties,
    leadingSlotRef: slotRef('leading'),
    trailingSlotRef: slotRef('trailing'),
    attachedSlotRef: slotRef('attached'),
    detachedSlotRef: slotRef('detached'),
    splitAttachedLeadingSlotRef: slotRef('splitAttachedLeading'),
    splitAttachedTrailingSlotRef: slotRef('splitAttachedTrailing'),
    splitDetachedLeadingSlotRef: slotRef('splitDetachedLeading'),
    splitDetachedTrailingSlotRef: slotRef('splitDetachedTrailing'),
    expandedClipSlotRef: slotRef('expandedClip'),
    registerSlot,

    isCompact: compact !== null,
    // Clipped across only, so rings and glows can still spill a little above and below.
    compactStyle: {
      ...islandSlotBase,
      height: metrics.compact.height,
      maxWidth: max,
      overflowX: 'clip',
    } satisfies CSSProperties,
    compactLeading: fitText(compact?.leading, max),
    compactTrailing: fitText(compact?.trailing, max),

    // Both layouts render; the frame loop shows the split when it fits and `minimal` otherwise.
    isMinimal: minimal !== null,
    minimalStyle: { ...islandSlotBase, height: metrics.minimal.height } satisfies CSSProperties,
    minimalAttached: minimal?.attached,
    hasDetached: minimal?.detached !== undefined,
    minimalDetached: minimal?.detached,
    hasSplit: split !== null,
    splitAttachedLeading: split?.attached.leading,
    splitAttachedTrailing: split?.attached.trailing,
    splitDetachedLeading: split?.detached.leading,
    splitDetachedTrailing: split?.detached.trailing,

    // The content clip sits inside the layer's blur, so the blur softens the clip's cut too.
    expandedPresentation: expanded,
    expandedClipStyle: { position: 'absolute', inset: 0 } satisfies CSSProperties,
    metrics,
    expandedWidth,
  }
}

export { useIslandLayer }
