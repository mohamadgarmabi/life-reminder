import { Flower2, Plus } from 'lucide-react'
import { FormDialog } from '#/modules/shell/components/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/modules/shell/components/states'
import { Button } from '#/modules/shell/components/ui/button'
import { PlantCard } from '#/modules/plants/components/plant-card'
import { PlantForm } from '#/modules/plants/components/plant-form'
import { WateringHistory } from '#/modules/plants/components/watering-history'
import { usePlants } from '#/modules/plants/hooks/plants.hook'

const PlantsView = () => {
  const {
    today,
    plants,
    headerDescription,
    isLoading,
    error,
    isEmpty,
    openCreate,
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
  } = usePlants()

  return (
    <>
      <PageHeader
        title="گل‌ها"
        description={headerDescription}
        action={
          <Button onClick={openCreate}>
            <Plus /> گیاه جدید
          </Button>
        }
      />

      {isLoading && <ListSkeleton />}
      {error && <ErrorState error={error} />}
      {isEmpty && (
        <EmptyState
          icon={Flower2}
          title="گیاهی ثبت نشده"
          description="گیاهانتان را با فاصلهٔ آبیاری اضافه کنید تا موعد آب دادن را یادآوری کنیم."
          action={
            <Button onClick={openCreate}>
              <Plus /> افزودن گیاه
            </Button>
          }
        />
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
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
      </div>

      <FormDialog open={isFormOpen} onOpenChange={handleOpenChange} title={formTitle}>
        {isCreating && <PlantForm onSubmit={handleCreate} />}
        {editingPlant && <PlantForm initial={editingPlant} onSubmit={handleEdit} />}
      </FormDialog>

      <FormDialog
        open={isHistoryOpen}
        onOpenChange={handleOpenChange}
        title="سابقهٔ آبیاری"
        description={historyDescription}
      >
        {historyPlant && <WateringHistory plantId={historyPlant.id} />}
      </FormDialog>
    </>
  )
}

export default PlantsView
