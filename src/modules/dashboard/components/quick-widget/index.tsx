import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import type { WidgetSize } from '#/modules/dashboard/types'
import { QUICK_ACTIONS } from '#/modules/dashboard/utils/dashboard.constants'
import { cn } from '#/modules/shell/utils/cn'

const QuickWidget = ({ size }: { size: WidgetSize }) => {
  const small = size === 'small'
  // shortcut: a quarter-width tile only fits one tappable button, so mini adds a reminder only.
  if (size === 'mini') {
    return (
      <Link
        to="/reminders"
        search={{ new: true }}
        aria-label="یادآور جدید"
        className="-m-2.5 flex flex-1 flex-col items-center justify-center gap-1 rounded-3xl text-[11px] font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95"
      >
        <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <Plus className="size-5" aria-hidden />
        </span>
        یادآور
      </Link>
    )
  }
  return (
    <>
      <p className="mb-2 text-sm font-semibold">افزودن سریع</p>
      <div className={cn('flex-1 gap-2', 'grid', small ? 'grid-cols-2' : 'grid-cols-4')}>
        {QUICK_ACTIONS.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            search={{ new: true }}
            className={cn(
              'flex flex-1 items-center gap-2 rounded-2xl bg-secondary text-sm font-medium transition-transform outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95',
              'flex-col justify-center',
              small ? 'py-1 text-xs' : 'py-3',
            )}
          >
            <span className="relative">
              <Icon className="size-5" aria-hidden />
              <Plus
                className="absolute -inset-e-2 -bottom-1 size-3 rounded-full bg-primary text-primary-foreground"
                aria-hidden
              />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </>
  )
}

export { QuickWidget }
