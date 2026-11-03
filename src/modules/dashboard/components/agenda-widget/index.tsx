import { Link } from '@tanstack/react-router'
import { useAgendaWidget } from '#/modules/dashboard/hooks/agenda-widget.hook'
import type { AgendaWidgetProps } from '#/modules/dashboard/types'
import { cn } from '#/modules/shell/utils/cn'

const AgendaWidget = (props: AgendaWidgetProps) => {
  const { title, empty, size, icon: Icon } = props
  const { countLabel, accentClassName, isEmpty, moreLabel, rows } = useAgendaWidget(props)

  if (size === 'mini') {
    return (
      <div className={cn('m-auto flex flex-col items-center', accentClassName)}>
        <Icon className="size-4" aria-hidden />
        <span className="text-2xl leading-tight font-bold tabular-nums">{countLabel}</span>
        <span className="text-[11px] text-muted-foreground">{title}</span>
      </div>
    )
  }
  if (size === 'small') {
    const first = rows[0]
    return (
      <>
        <div className={cn('flex items-center justify-between', accentClassName)}>
          <Icon className="size-5" aria-hidden />
          <span className="text-4xl leading-none font-bold tabular-nums">{countLabel}</span>
        </div>
        <p className="mt-auto text-sm font-semibold">{title}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{first ? first.title : empty}</p>
      </>
    )
  }

  return (
    <>
      <div className={cn('mb-1 flex items-center gap-2', accentClassName)}>
        <Icon className="size-4" aria-hidden />
        <p className="flex-1 text-sm font-semibold">{title}</p>
        <span className="text-sm font-semibold tabular-nums">{countLabel}</span>
      </div>
      {isEmpty ? (
        <p className="my-auto py-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="-mx-2">
          {rows.map((row) => (
            <li key={row.key}>
              <Link
                to={row.to}
                className="flex min-h-12 items-center gap-3 rounded-2xl px-2 py-1.5 transition-colors hover:bg-accent active:bg-accent"
              >
                <span className="rounded-lg bg-secondary p-2 text-foreground">
                  <row.Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{row.title}</span>
                  <span className="block text-xs text-muted-foreground">{row.subtitle}</span>
                </span>
                <span className={row.metaClassName}>{row.when}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {moreLabel && <p className="mt-1 text-xs text-muted-foreground">{moreLabel}</p>}
    </>
  )
}

export { AgendaWidget }
