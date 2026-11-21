import { Flower2, Plus, Stethoscope } from 'lucide-react'
import { FormDialog } from '#/modules/shell/components/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/modules/shell/components/states'
import { Button } from '#/components/button'
import { Tabs, TabsList, TabsTrigger } from '#/components/tabs'
import { FilterPill } from '#/modules/shell/components/filter-pill'
import { SwipeHint } from '#/modules/shell/components/swipe-hint'
import { AnimatedList } from '#/modules/shell/components/animated-list'
import { ViewToggle } from '#/modules/shell/components/view-toggle'
import { useViewMode } from '#/modules/shell/hooks/view-toggle.hook'
import { PlantCard } from '#/modules/plants/components/plant-card'
import { isPlantAiAvailable } from '#/modules/plants/apis/plant-ai.api'
import { PlantDoctor } from '#/modules/plants/components/plant-doctor'
import { PlantForm } from '#/modules/plants/components/plant-form'
import { WateringHistory } from '#/modules/plants/components/watering-history'
import { usePlants } from '#/modules/plants/hooks/plants.hook'
import { t } from '#/modules/shell/utils/i18n'

const PlantsView = () => {
  const {
    today,
    plants,
    headerDescription,
    isLoading,
    error,
    isEmpty,
    openCreate,
    openDoctor,
    isDoctorOpen,
    handleOpenChange,
    isFormOpen,
    formTitle,
    isCreating,
    handleCreate,
    editingPlant,
    handleEdit,
    historyPlant,
    isHistoryOpen,
    historyDescription,
    hasItems,
    isFilterEmpty,
    filter,
    filters,
    handleFilterChange,
  } = usePlants()
  const { view } = useViewMode('plants')

  return (
    <>
      <PageHeader
        title={t('plants.title')}
        description={headerDescription}
        action={
          <div className="flex items-center gap-2">
            <ViewToggle page="plants" />
            {isPlantAiAvailable && (
              <Button variant="secondary" size="icon" aria-label={t('plants.doctor')} onClick={openDoctor}>
                <Stethoscope />
              </Button>
            )}
            <Button onClick={openCreate}>
              <Plus /> {t('plants.new')}
            </Button>
          </div>
        }
      >
        {hasItems && (
          <Tabs value={filter} onValueChange={handleFilterChange}>
            <FilterPill>
              {/* justify-start: centered overflow clips the leading tabs out of scroll reach */}
              <TabsList className="w-full justify-start overflow-x-auto scrollbar-none">
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
          icon={Flower2}
          title={t('plants.emptyTitle')}
          description={t('plants.emptyDescription')}
          action={
            <Button onClick={openCreate}>
              <Plus /> {t('plants.add')}
            </Button>
          }
        />
      )}
      {isFilterEmpty && <p className="py-10 text-center text-sm text-muted-foreground">{t('plants.filterEmpty')}</p>}
      {plants.length > 0 && <SwipeHint />}
      <AnimatedList view={view}>
        {plants.map((row) => (
          <PlantCard
            key={row.plant.id}
            plant={row.plant}
            today={today}
            onEdit={row.onEdit}
            onHistory={row.onHistory}
            onDelete={row.onDelete}
          />
        ))}
      </AnimatedList>

      <FormDialog open={isFormOpen} onOpenChange={handleOpenChange} title={formTitle}>
        {isCreating && <PlantForm onSubmit={handleCreate} />}
        {editingPlant && <PlantForm initial={editingPlant} onSubmit={handleEdit} />}
      </FormDialog>

      <FormDialog
        open={isHistoryOpen}
        onOpenChange={handleOpenChange}
        title={t('plants.history')}
        description={historyDescription}
      >
        {historyPlant && <WateringHistory plant={historyPlant} />}
      </FormDialog>

      <FormDialog
        open={isDoctorOpen}
        onOpenChange={handleOpenChange}
        title={t('plants.doctor')}
        description={t('plants.doctorDescription')}
      >
        {isDoctorOpen && <PlantDoctor />}
      </FormDialog>
    </>
  )
}

export default PlantsView
