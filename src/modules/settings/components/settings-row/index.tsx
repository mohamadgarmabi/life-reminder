import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Label } from '#/components/label'
import { cn } from '#/modules/shell/utils/cn'
import type { SettingsRowProps } from '#/modules/settings/types'

const SettingsRow = ({
  icon: Icon,
  tone,
  title,
  description,
  htmlFor,
  trailing,
  children,
  onClick,
  to,
  destructive,
}: SettingsRowProps) => {
  const isAction = !!(onClick || to)
  const body = (
    <>
      <div className="flex min-h-14 items-center gap-3 py-2.5">
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg text-white', tone)}>
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          {htmlFor ? (
            <Label htmlFor={htmlFor} className="text-sm font-medium">
              {title}
            </Label>
          ) : (
            <p className={cn('text-sm font-medium', destructive && 'text-destructive')}>{title}</p>
          )}
          {description && <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>}
        </div>
        {trailing}
        {isAction && <ChevronLeft className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
      </div>
      {children && <div className="pb-3">{children}</div>}
    </>
  )

  const className = cn(
    'block w-full px-4 text-start',
    isAction && 'outline-none transition-colors focus-visible:bg-accent active:bg-accent',
  )
  if (to)
    return (
      <Link to={to} className={className}>
        {body}
      </Link>
    )
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    )
  return <div className={className}>{body}</div>
}

export { SettingsRow }
