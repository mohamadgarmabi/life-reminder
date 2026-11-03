import { Button } from '#/components/button'
import { Skeleton } from '#/components/skeleton'
import { AgendaWidget } from '#/modules/dashboard/components/agenda-widget'
import { DateWidget } from '#/modules/dashboard/components/date-widget'
import { GamesWidget } from '#/modules/dashboard/components/games-widget'
import { QuickWidget } from '#/modules/dashboard/components/quick-widget'
import { Widget } from '#/modules/dashboard/components/widget'
import { useDashboard } from '#/modules/dashboard/hooks/dashboard.hook'
import type { WidgetConfig } from '#/modules/dashboard/types'
import { AGENDA_WIDGETS } from '#/modules/dashboard/utils/dashboard.constants'
import { ErrorState, PageHeader } from '#/modules/shell/components/states'

const HomeView = () => {
  const {
    now,
    dateLabel,
    error,
    agenda,
    summary,
    widgets,
    editing,
    toggleEditing,
    startEditing,
    handleMove,
    handleToggleSize,
  } = useDashboard()

  const content = ({ id, size }: WidgetConfig) => {
    if (id === 'date') return <DateWidget size={size} now={now} summary={summary} />
    if (id === 'quick') return <QuickWidget size={size} />
    if (id === 'games') return <GamesWidget size={size} />
    if (!agenda) return <Skeleton className="h-full w-full rounded-2xl" />
    return <AgendaWidget size={size} items={agenda[id]} now={now} {...AGENDA_WIDGETS[id]} />
  }

  return (
    <>
      <PageHeader
        title="امروز"
        description={dateLabel}
        action={
          <Button variant={editing ? 'default' : 'secondary'} size="sm" onClick={toggleEditing}>
            {editing ? 'تمام' : 'ویرایش'}
          </Button>
        }
      />

      {error && <ErrorState error={error} />}
      {editing && (
        <p className="mb-3 text-center text-xs text-muted-foreground">
          ویجت‌ها را بکشید تا جابه‌جا شوند؛ دکمهٔ گوشه اندازه را عوض می‌کند.
        </p>
      )}
      {/* 4 columns: mini 1, small 2, large 4. dense: smaller tiles fill gaps a bigger one would leave. */}
      <div className="grid grid-flow-row-dense grid-cols-4 gap-3">
        {widgets.map((config) => (
          <Widget
            key={config.id}
            config={config}
            editing={editing}
            onMove={handleMove}
            onToggleSize={handleToggleSize}
            onLongPress={startEditing}
          >
            {content(config)}
          </Widget>
        ))}
      </div>
    </>
  )
}

export default HomeView
