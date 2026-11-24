import { CircleCheckIcon, InfoIcon, OctagonXIcon } from 'lucide-react'
import { toast as sonner } from 'sonner'
import { Button } from '#/components/button'
import { cn } from '#/modules/shell/utils/cn'
import type { ToastCardProps, ToastKind, ToastOptions } from './sonner.types'
import { GlassCard } from '../liquid-glass'

const ICON = { success: CircleCheckIcon, error: OctagonXIcon, info: InfoIcon }

// Card rendered through sonner's custom toasts, so its queue, stacking and swipe still apply.
const ToastCard = ({ id, kind, message, action }: ToastCardProps) => {
  const Icon = ICON[kind]
  return (
    <GlassCard live blur={1} className='relative flex mx-auto w-full max-w-lg items-center gap-3 rounded-2xl p-4 text-sm'>
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
    </GlassCard>
  )
}

const show =
  (kind: ToastKind) =>
  (message: string, options: ToastOptions = {}) =>
    sonner.custom((id) => 
      <ToastCard id={id} kind={kind} message={message} action={options.action} />
    )

/** App toasts: same calls as sonner's toast.success / error / info, drawn as cards. */
const toast = { success: show('success'), error: show('error'), info: show('info') }

export { toast }
