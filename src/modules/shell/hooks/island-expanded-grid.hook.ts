import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react'
import type { IslandExpandedGridProps } from '#/modules/shell/types/island'
import {
  ISLAND_COLUMN_GAP,
  islandIntrinsic,
  islandRegion,
  islandSlotBase,
} from '#/modules/shell/utils/island-layer.styles'

/** Each wrapper's own max-content width, read with its cap lifted (a capped one never reports text that grew). */
const naturalWidth = (element: HTMLElement | null) => {
  if (!element) return 0
  const cap = element.style.maxWidth
  element.style.maxWidth = 'none'
  // The used width: fractional (a column a fraction narrower than its text ellipsizes it) and
  // untransformed (regions scale while they come in).
  const width = Number.parseFloat(getComputedStyle(element).width) || 0
  element.style.maxWidth = cap
  return Math.ceil(width) + 1
}

/**
 * The expanded regions. Leading and trailing get equal columns as wide as the wider of the two, so
 * the center keeps the island's centre line and takes the rest of the row (unless that would cut it
 * short: then each side keeps its own width). A spanning bottom region never widens the side columns.
 * The top row is vertically centred: leading, center and trailing share one middle line.
 */
const useIslandExpandedGrid = ({ presentation, register, metrics, expandedWidth }: IslandExpandedGridProps) => {
  const e = metrics.expanded
  const hasBottom = presentation.bottom !== undefined && presentation.bottom !== null
  // ActivityKit puts the center region below the sensor: its top is the sensor's bottom edge.
  const sensorBottom = metrics.top + metrics.idle.height
  const centerTop = Math.max(0, sensorBottom - (e.top + e.padding.top)) + e.centerTop
  const centerShift = ((e.padding.trailing ?? e.padding.side) - e.padding.side) / 2
  const inner = useRef<HTMLDivElement | null>(null)
  const leading = useRef<HTMLDivElement>(null)
  const center = useRef<HTMLDivElement>(null)
  const trailing = useRef<HTMLDivElement>(null)
  // Null until measured: the first layout gives each side its own content width.
  const [columns, setColumns] = useState<string | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const l = naturalWidth(leading.current)
      const t = naturalWidth(trailing.current)
      const c = naturalWidth(center.current)
      const room = (inner.current?.clientWidth ?? 0) - 2 * ISLAND_COLUMN_GAP
      const side = Math.max(l, t)
      // Equal sides keep the center on the island's centre line. Wrapping text may narrow to half the row
      // for it; only a center squeezed below that falls back to each side's own width.
      const next =
        room - 2 * side >= Math.min(c, room / 2) ? `${side}px minmax(0, 1fr) ${side}px` : `${l}px minmax(0, 1fr) ${t}px`
      setColumns((previous) => (previous === next ? previous : next))
    }
    let live = true
    void document.fonts?.ready.then(() => {
      if (live) measure()
    })
    // The observer also reports each element's first size as soon as it starts observing.
    const observer = new ResizeObserver(measure)
    for (const element of [inner.current, leading.current, center.current, trailing.current]) {
      if (element) observer.observe(element)
    }
    return () => {
      live = false
      observer.disconnect()
    }
  }, [])

  return {
    gridRef: (element: HTMLElement | null) => register('expanded', element),
    gridStyle: {
      ...islandSlotBase,
      display: 'block',
      width: expandedWidth,
      boxSizing: 'border-box',
      padding: `${e.padding.top}px ${e.padding.trailing ?? e.padding.side}px ${e.padding.bottom}px ${e.padding.side}px`,
      transformOrigin: '50% 0',
    } satisfies CSSProperties,
    innerRef: (element: HTMLDivElement | null) => {
      inner.current = element
      register('expandedInner', element)
    },
    innerStyle: {
      display: 'grid',
      gridTemplateColumns: columns ?? 'max-content minmax(0, 1fr) max-content',
      gridTemplateAreas: hasBottom ? '"leading center trailing" "bottom bottom bottom"' : '"leading center trailing"',
      columnGap: ISLAND_COLUMN_GAP,
      rowGap: hasBottom ? e.rowGap : 0,
      // Icon, message and action share one middle line.
      alignItems: 'center',
    } satisfies CSSProperties,
    intrinsicStyle: islandIntrinsic,
    leadingRegionRef: (element: HTMLElement | null) => register('expandedLeading', element),
    leadingRegionStyle: { ...islandRegion, gridArea: 'leading' } satisfies CSSProperties,
    leadingRef: leading,
    leadingContent: presentation.leading,
    centerRegionRef: (element: HTMLElement | null) => register('expandedCenter', element),
    // Centred on the island, not on the content between unequal side paddings.
    centerRegionStyle: {
      ...islandRegion,
      gridArea: 'center',
      alignSelf: 'center',
      position: 'relative',
      left: centerShift,
      paddingTop: centerTop,
      display: 'flex',
      justifyContent: 'center',
      textAlign: 'center',
    } satisfies CSSProperties,
    centerRef: center,
    centerContent: presentation.center,
    trailingRegionRef: (element: HTMLElement | null) => register('expandedTrailing', element),
    trailingRegionStyle: { ...islandRegion, gridArea: 'trailing', justifySelf: 'end' } satisfies CSSProperties,
    trailingRef: trailing,
    trailingContent: presentation.trailing,
    hasBottom,
    bottomRegionRef: (element: HTMLElement | null) => register('expandedBottom', element),
    bottomRegionStyle: {
      ...islandRegion,
      gridArea: 'bottom',
      paddingInline: e.bottomInset,
      contain: 'inline-size',
    } satisfies CSSProperties,
    bottomContent: presentation.bottom,
  }
}

export { useIslandExpandedGrid }
