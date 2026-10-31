import { Link } from '@tanstack/react-router'
import { CalendarCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/modules/shell/components/ui/card'
import { useAgendaSection } from '#/modules/dashboard/hooks/agenda-section.hook'
import type { AgendaSectionProps } from '#/modules/dashboard/types'

const AgendaSection = (props: AgendaSectionProps) => {
  const { cardClassName, titleClassName, isEmpty, rows } = useAgendaSection(props)
  return (
    <Card className={cardClassName}>
      <CardHeader>
        <CardTitle className={titleClassName}>{props.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <CalendarCheck className="size-4" aria-hidden /> {props.empty}
          </p>
        ) : (
          <ul className="-mx-2">
            {rows.map((row) => (
              <li key={row.key}>
                <Link
                  to={row.to}
                  className="flex min-h-12 items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-accent active:bg-accent"
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
      </CardContent>
    </Card>
  )
}

export { AgendaSection }
