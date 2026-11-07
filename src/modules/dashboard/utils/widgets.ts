import type { WidgetConfig, WidgetId, WidgetSize } from '#/modules/dashboard/types'
import { DEFAULT_SETTINGS } from '#/modules/settings/stores/settings.store'

/** Saved layout plus any widget added in a later version (appended with its default size). */
const withAllWidgets = (saved: WidgetConfig[]): WidgetConfig[] => [
  ...saved,
  ...DEFAULT_SETTINGS.widgets.filter((d) => !saved.some((w) => w.id === d.id)),
]
/** Moves `from` to the slot `to` currently holds (the drop target), shifting the rest. */
const moveWidget = (list: WidgetConfig[], from: WidgetId, to: WidgetId): WidgetConfig[] => {
  const fromIndex = list.findIndex((w) => w.id === from)
  const toIndex = list.findIndex((w) => w.id === to)
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return list
  const next = [...list]
  next.splice(toIndex, 0, ...next.splice(fromIndex, 1))
  return next
}

const NEXT_SIZE: Record<WidgetSize, WidgetSize> = { mini: 'small', small: 'large', large: 'mini' }

/** Cycles mini → small → large → mini. */
const toggleWidgetSize = (list: WidgetConfig[], id: WidgetId): WidgetConfig[] =>
  list.map((w) => (w.id === id ? { ...w, size: NEXT_SIZE[w.size] } : w))

export { withAllWidgets, moveWidget, toggleWidgetSize }
