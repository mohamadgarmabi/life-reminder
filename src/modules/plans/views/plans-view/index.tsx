import { Plus, Target } from 'lucide-react'
import { FormDialog } from '#/modules/shell/components/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/modules/shell/components/states'
import { FilterPill } from '#/modules/shell/components/filter-pill'
import { FilterSheet } from '#/modules/shell/components/filter-sheet'
import { SwipeHint } from '#/modules/shell/components/swipe-hint'
import { AnimatedList } from '#/modules/shell/components/animated-list'
import { Button } from '#/components/button'
import { Card, CardContent } from '#/components/card'
import { Progress } from '#/components/progress'
import { Select } from '#/components/select'
import { Tabs, TabsList, TabsTrigger } from '#/components/tabs'
import { PlanCard } from '#/modules/plans/components/plan-card'
import { PlanForm } from '#/modules/plans/components/plan-form'
import { PlanTutor } from '#/modules/plans/components/plan-tutor'
import { usePlans } from '#/modules/plans/hooks/plans.hook'
import { t } from '#/modules/shell/utils/i18n'

const PlansView = () => {
  const {
    plans,
    isLoading,
    error,
    isEmpty,
    hasItems,
    isFilterEmpty,
    filter,
    filters,
    handleFilterChange,
    report,
    year,
    yearOptions,
    handleYearChange,
    sort,
    sortOptions,
    handleSortChange,
    tag,
    hasTags,
    tagOptions,
    handleTagChange,
    activeFilterCount,
    handleResetFilters,
    listLabel,
    defaultYear,
    isFormOpen,
    formTitle,
    editItem,
    handleOpenCreate,
    handleOpenChange,
    handleCreate,
    handleUpdate,
    tutorPlan,
    tutorTitle,
  } = usePlans()

  return (
    <>
      <PageHeader
        title={t('plans.title')}
        action={
          <Button onClick={handleOpenCreate}>
            <Plus /> {t('plans.new')}
          </Button>
        }
      >
        {hasItems && (
          <Tabs value={filter} onValueChange={handleFilterChange}>
            <FilterPill>
              {/* justify-start: centered overflow clips the leading tabs out of scroll reach */}
              <TabsList className="w-full justify-start overflow-x-auto [scrollbar-width:none]">
                {filters.map((f) => (
                  <TabsTrigger key={f.value} value={f.value}>
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </FilterPill>
          </Tabs>
        )}
      </PageHeader>

      {isLoading && <ListSkeleton />}
      {error && <ErrorState error={error} />}
      {isEmpty && (
        <EmptyState
          icon={Target}
          title={t('plans.emptyTitle')}
          description={t('plans.emptyDescription')}
          action={
            <Button onClick={handleOpenCreate}>
              <Plus /> {t('plans.add')}
            </Button>
          }
        />
      )}
      {hasItems && (
        <>
          <Card className="mb-3 gap-0 py-0">
            <CardContent className="space-y-2 p-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">{report.title}</h2>
                <span className="text-2xl font-bold text-primary">{report.percentLabel}</span>
              </div>
              <Progress value={report.percent} aria-label={report.title} />
              <p className="text-xs text-muted-foreground">{report.detail}</p>
              <dl className="grid grid-cols-4 gap-1 pt-1 text-center">
                {report.stats.map((s) => (
                  <div key={s.key} className="rounded-lg bg-muted/50 py-1.5">
                    <dd className="text-sm font-semibold">{s.value}</dd>
                    <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">{listLabel}</p>
            <FilterSheet activeCount={activeFilterCount} onReset={handleResetFilters}>
              <Select
                nested
                label={t('plans.year')}
                value={year}
                onValueChange={handleYearChange}
                options={yearOptions}
              />
              <Select
                nested
                label={t('plans.sort')}
                value={sort}
                onValueChange={handleSortChange}
                options={sortOptions}
              />
              {hasTags && (
                <Select
                  nested
                  label={t('plans.tag')}
                  value={tag}
                  onValueChange={handleTagChange}
                  options={tagOptions}
                />
              )}
            </FilterSheet>
          </div>
          <SwipeHint />
        </>
      )}
      {isFilterEmpty && <p className="py-10 text-center text-sm text-muted-foreground">{t('plans.filterEmpty')}</p>}
      <AnimatedList view="list">
        {plans.map((p) => (
          <PlanCard key={p.plan.id} plan={p.plan} onEdit={p.onEdit} onTutor={p.onTutor} />
        ))}
      </AnimatedList>

      <FormDialog open={isFormOpen} onOpenChange={handleOpenChange} title={formTitle}>
        {isFormOpen && !editItem && <PlanForm defaultYear={defaultYear} onSubmit={handleCreate} />}
        {editItem && <PlanForm initial={editItem} defaultYear={defaultYear} onSubmit={handleUpdate} />}
      </FormDialog>

      <FormDialog open={!!tutorPlan} onOpenChange={handleOpenChange} title={tutorTitle}>
        {tutorPlan && <PlanTutor plan={tutorPlan} />}
      </FormDialog>
    </>
  )
}

export default PlansView
