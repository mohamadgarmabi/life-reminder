import { ErrorState, ListSkeleton, PageHeader } from '#/modules/shell/components/states'
import { AgendaSection } from '#/modules/dashboard/components/agenda-section'
import { QuickAction } from '#/modules/dashboard/components/quick-action'
import { Stat } from '#/modules/dashboard/components/stat'
import { useDashboard } from '#/modules/dashboard/hooks/dashboard.hook'

const HomeView = () => {
  const { now, dateLabel, quickActions, isLoading, error, agenda, hasOverdue, overdueTone } = useDashboard()

  return (
    <>
      <PageHeader title="امروز" description={dateLabel} />

      <div className="mb-6 grid grid-cols-3 gap-2">
        {quickActions.map((action) => (
          <QuickAction key={action.to} {...action} />
        ))}
      </div>

      {isLoading && <ListSkeleton />}
      {error && <ErrorState error={error} />}
      {agenda && (
        <>
          <div className="mb-6 grid grid-cols-3 gap-2 text-center">
            <Stat label="معوق" value={agenda.overdue.length} tone={overdueTone} />
            <Stat label="امروز" value={agenda.today.length} />
            <Stat label="۷ روز آینده" value={agenda.upcoming.length} />
          </div>
          <div className="space-y-4">
            {hasOverdue && <AgendaSection title="معوق" items={agenda.overdue} now={now} danger />}
            <AgendaSection
              title="امروز"
              items={agenda.today}
              now={now}
              empty="برای امروز کاری ثبت نشده. روز آرامی داشته باشید!"
            />
            <AgendaSection title="روزهای آینده" items={agenda.upcoming} now={now} empty="در هفتهٔ پیش رو موردی نیست." />
          </div>
        </>
      )}
    </>
  )
}

export default HomeView
