import { Button } from '#/components/button'
import { Skeleton } from '#/components/skeleton'
import { AgendaWidget } from '#/modules/dashboard/components/agenda-widget'
import { DateWidget } from '#/modules/dashboard/components/date-widget'
import { GamesWidget } from '#/modules/dashboard/components/games-widget'
import { PlansWidget } from '#/modules/dashboard/components/plans-widget'
import { PlantsWidget } from '#/modules/dashboard/components/plants-widget'
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
    plants,
    plans,
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
    if (id === 'plans')
      return plans ? <PlansWidget size={size} plans={plans} /> : <Skeleton className="h-full w-full rounded-2xl" />
    if (id === 'plants')
      return plants ? <PlantsWidget size={size} plants={plants} /> : <Skeleton className="h-full w-full rounded-2xl" />
    if (!agenda) return <Skeleton className="h-full w-full rounded-2xl" />
    return <AgendaWidget size={size} items={agenda[id]} now={now} {...AGENDA_WIDGETS[id]} />
  }

  const widget = (config: WidgetConfig) => (
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
  )

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
      {/* 4 columns of square cells (row height = column width; 2.25rem = 3 gaps): mini 1×1, small 2×2, large 4 wide.
          Rows grow only for taller content. dense: a later mini fills a free cell beside or under earlier tiles. */}
      <div className="@container">
        <div className="grid grid-flow-row-dense auto-rows-[minmax(calc((100cqw-2.25rem)/4),auto)] grid-cols-4 gap-3">
          {widgets.map(widget)}
        </div>
      </div>
    </>
  )
}

export default HomeView
