import { CircleCheckIcon, InfoIcon, OctagonXIcon } from 'lucide-react'
import { toast as sonner } from 'sonner'
import { Button } from '#/components/button'
import { GlassLayer } from '#/components/glass'
import { cn } from '#/modules/shell/utils/cn'
import type { GlassToastProps, ToastKind, ToastOptions } from './sonner.types'

const ICON = { success: CircleCheckIcon, error: OctagonXIcon, info: InfoIcon }

// Glass card rendered through sonner's custom toasts, so its queue, stacking and swipe still apply.
const GlassToast = ({ id, kind, message, action }: GlassToastProps) => {
  const Icon = ICON[kind]
  return (
    <div className="relative isolate flex w-(--width) items-center gap-3 rounded-2xl p-4 text-sm text-popover-foreground">
      <GlassLayer radius={16} thick />
      <Icon className={cn('size-4 shrink-0', kind === 'error' && 'text-destructive')} aria-hidden />
      <p className="flex-1">{message}</p>
      {action && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            action.onClick()
            sonner.dismiss(id)
          }}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

const show = (kind: ToastKind) => (message: string, options: ToastOptions = {}) =>
  sonner.custom((id) => <GlassToast id={id} kind={kind} message={message} action={options.action} />)

/** App toasts: same calls as sonner's toast.success / error / info, drawn as liquid glass. */
const toast = { success: show('success'), error: show('error'), info: show('info') }

export { toast }
