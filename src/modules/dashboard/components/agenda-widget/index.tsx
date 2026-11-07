import { Link } from '@tanstack/react-router'
import { useAgendaWidget } from '#/modules/dashboard/hooks/agenda-widget.hook'
import type { AgendaWidgetProps } from '#/modules/dashboard/types'
import { cn } from '#/modules/shell/utils/cn'

/** Vertical swipe pager (scroll-snap): each child is one page of the same height as the box. */
const SWIPE = 'snap-y snap-mandatory overflow-y-auto [scrollbar-width:none]'

const AgendaWidget = (props: AgendaWidgetProps) => {
  const { title, empty, size, icon: Icon } = props
  const { countLabel, accentClassName, isEmpty, moreLabel, pages } = useAgendaWidget(props)

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
    return (
      <>
        <div className={cn('flex items-center justify-between', accentClassName)}>
          <Icon className="size-5" aria-hidden />
          <span className="text-4xl leading-none font-bold tabular-nums">{countLabel}</span>
        </div>
        <p className="mt-auto text-sm font-semibold">{title}</p>
        {isEmpty ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">{empty}</p>
        ) : (
          <ul className={cn(SWIPE, 'h-8')}>
            {pages.map(([row]) => (
              <li key={row.key} className="h-8 snap-start">
                <Link to={row.to} className="line-clamp-2 text-xs text-muted-foreground">
                  {row.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {moreLabel && <p className="text-[10px] text-muted-foreground">{moreLabel}</p>}
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
        // One page = up to three 3rem rows; swipe up/down for the next. A single page keeps its natural height.
        <ul className={cn(SWIPE, '-mx-2', pages.length > 1 && 'h-36')}>
          {pages.map((page) => (
            <li key={page[0].key} className={cn('snap-start', pages.length > 1 && 'h-36')}>
              {page.map((row) => (
                <Link
                  key={row.key}
                  to={row.to}
                  className="flex h-12 items-center gap-3 rounded-2xl px-2 transition-colors hover:bg-accent active:bg-accent"
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
              ))}
            </li>
          ))}
        </ul>
      )}
      {moreLabel && <p className="mt-1 text-xs text-muted-foreground">{moreLabel}</p>}
    </>
  )
}

export { AgendaWidget }
