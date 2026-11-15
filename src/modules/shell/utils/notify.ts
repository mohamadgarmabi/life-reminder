import { CircleCheck, Info, OctagonX, type LucideIcon } from 'lucide-react'
import { createElement } from 'react'
import type { NotifyKind, NotifyOptions } from '#/modules/shell/types'
import { islandClock, islandStore } from '#/modules/shell/stores/island.store'
import { notifyActionStyles, notifyIconStyles, notifyMessageStyles } from '#/modules/shell/utils/notify.styles'

/** One activity for every message: a new one crossfades over the last, as a stacked toast would replace it. */
const ID = 'notify'

const ICON: Record<NotifyKind, LucideIcon> = { success: CircleCheck, error: OctagonX, info: Info }

/** How long a message stays (ms). Errors read longer; an undo stays for islandcn's whole alert hold. */
const DURATION: Record<NotifyKind, number> = { success: 3500, error: 5000, info: 4000 }
const ACTION_DURATION = 6000

let cancelEnd: (() => void) | null = null

const close = () => {
  cancelEnd?.()
  cancelEnd = null
  islandStore.api.end(ID)
}

const icon = (kind: NotifyKind, size: 'compact' | 'expanded') =>
  createElement(ICON[kind], { 'aria-hidden': true, strokeWidth: 2.25, className: notifyIconStyles({ kind, size }) })

const actionButton = (action: NotifyOptions['action']) =>
  action &&
  createElement(
    'button',
    {
      type: 'button',
      className: notifyActionStyles(),
      onClick: () => {
        action.onClick()
        close()
      },
    },
    action.label,
  )

/**
 * Shows `message` in the Dynamic Island: it expands with the message (an alerting activity), then
 * leaves on its own. The compact pill keeps only the icon, so the glyph sits on the right (RTL),
 * in the compact's physical trailing slot; the expanded grid already follows the page direction.
 */
const show =
  (kind: NotifyKind) =>
  (message: string, { action }: NotifyOptions = {}) => {
    const content = {
      label: message,
      compact: { trailing: icon(kind, 'compact') },
      minimal: icon(kind, 'compact'),
      expanded: {
        leading: icon(kind, 'expanded'),
        center: createElement('p', { className: notifyMessageStyles() }, message),
        trailing: actionButton(action),
      },
    }
    const running = islandStore.getSnapshot().activities.some((activity) => activity.id === ID)
    if (running) islandStore.api.update(ID, { ...content, alert: true, transition: 'crossfade' })
    else islandStore.api.start({ id: ID, ...content, alert: true })

    cancelEnd?.()
    cancelEnd = islandClock.at(islandClock.now() + (action ? ACTION_DURATION : DURATION[kind]), close)
  }

/** App messages in the Dynamic Island; replaces sonner's toast with the same calls. */
const notify = { success: show('success'), error: show('error'), info: show('info') }

export { notify }
