import { useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { WidgetId, WidgetProps } from '#/modules/dashboard/types'
import { SIZE_LABEL, WIDGET_LABEL } from '#/modules/dashboard/utils/dashboard.constants'
import { t } from '#/modules/shell/utils/i18n'

const LONG_PRESS_MS = 500
// After a swap the neighbours animate under the finger; without a pause they would swap straight back.
const MOVE_COOLDOWN_MS = 250

const useWidget = ({ config, editing, onMove, onToggleSize, onLongPress }: WidgetProps) => {
  const pressTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastMove = useRef(0)
  const cancelPress = () => clearTimeout(pressTimer.current)
  useEffect(() => cancelPress, [])

  const handleDrag = (event: PointerEvent) => {
    if (performance.now() - lastMove.current < MOVE_COOLDOWN_MS) return
    const target = document
      .elementsFromPoint(event.clientX, event.clientY)
      .map((el) => el.closest<HTMLElement>('[data-widget]'))
      .find((el) => el && el.dataset.widget !== config.id)
    if (!target) return
    lastMove.current = performance.now()
    onMove(config.id, target.dataset.widget as WidgetId)
  }

  return {
    size: config.size,
    sizeLabel: t('dashboard.size.toggle', { label: t(WIDGET_LABEL[config.id]), size: t(SIZE_LABEL[config.size]) }),
    handleDrag,
    handleToggleSize: () => onToggleSize(config.id),
    pressHandlers: {
      onPointerDown: (e: ReactPointerEvent) => {
        if (!editing && e.isPrimary) pressTimer.current = setTimeout(onLongPress, LONG_PRESS_MS)
      },
      onPointerUp: cancelPress,
      onPointerLeave: cancelPress,
      onPointerCancel: cancelPress,
      // A scroll starting on the widget is not a long press.
      onPointerMove: (e: ReactPointerEvent) =>
        Math.abs(e.movementX) + Math.abs(e.movementY) > 4 ? cancelPress() : undefined,
    },
  }
}

export { useWidget }
