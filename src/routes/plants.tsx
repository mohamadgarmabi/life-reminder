import { createFileRoute } from '@tanstack/react-router'
import { Flower2, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConfirmDialog, FormDialog } from '#/components/shared/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/components/shared/states'
import { Button } from '#/components/ui/button'
import { useLiveQuery } from '#/db/live'
import { PlantCard } from '#/features/plants/components/plant-card'
import { PlantForm } from '#/features/plants/components/plant-form'
import { WateringHistory } from '#/features/plants/components/watering-history'
import { plantRepo } from '#/features/plants/repository'
import type { Plant } from '#/features/plants/schema'
import { nextWateringDate } from '#/features/plants/schedule'
import { toIsoDate } from '#/lib/dates'
import { toFaDigits } from '#/lib/format'
import { useNow } from '#/lib/use-now'

export const Route = createFileRoute('/plants')({
  validateSearch: z.object({ new: z.boolean().optional() }),
  component: PlantsPage,
})

type Dialog = { type: 'create' } | { type: 'edit' | 'history' | 'delete'; item: Plant } | null

function PlantsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [dialog, setDialog] = useState<Dialog>(search.new ? { type: 'create' } : null)
  const today = toIsoDate(useNow())
  const q = useLiveQuery(() => plantRepo.list())

  const close = () => {
    setDialog(null)
    if (search.new) void navigate({ search: {}, replace: true })
  }
  const save = async (task: Promise<unknown>, message: string) => {
    try {
      await task
      toast.success(message)
      close()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا در ذخیره‌سازی')
    }
  }

  const plants = [...(q.data ?? [])].sort((a, b) => nextWateringDate(a).localeCompare(nextWateringDate(b)))
  const thirsty = plants.filter((p) => nextWateringDate(p) <= today).length

  return (
    <>
      <PageHeader
        title="گل‌ها"
        description={plants.length ? (thirsty ? `${toFaDigits(thirsty)} گیاه امروز آب می‌خواهد` : 'همه سیراب‌اند') : undefined}
        action={<Button onClick={() => setDialog({ type: 'create' })}><Plus /> گیاه جدید</Button>}
      />

      {q.status === 'loading' && <ListSkeleton />}
      {q.status === 'error' && <ErrorState error={q.error} />}
      {q.status === 'success' && !plants.length && (
        <EmptyState
          icon={Flower2}
          title="گیاهی ثبت نشده"
          description="گیاهانتان را با فاصلهٔ آبیاری اضافه کنید تا موعد آب دادن را یادآوری کنیم."
          action={<Button onClick={() => setDialog({ type: 'create' })}><Plus /> افزودن گیاه</Button>}
        />
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {plants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            today={today}
            onEdit={() => setDialog({ type: 'edit', item: plant })}
            onHistory={() => setDialog({ type: 'history', item: plant })}
            onDelete={() => setDialog({ type: 'delete', item: plant })}
          />
        ))}
      </div>

      <FormDialog
        open={dialog?.type === 'create' || dialog?.type === 'edit'}
        onOpenChange={(o) => !o && close()}
        title={dialog?.type === 'edit' ? 'ویرایش گیاه' : 'گیاه جدید'}
      >
        {dialog?.type === 'create' && <PlantForm onSubmit={(v) => save(plantRepo.create(v), 'گیاه اضافه شد.')} />}
        {dialog?.type === 'edit' && (
          <PlantForm initial={dialog.item} onSubmit={(v) => save(plantRepo.update(dialog.item.id, v), 'تغییرات ذخیره شد.')} />
        )}
      </FormDialog>

      <FormDialog
        open={dialog?.type === 'history'}
        onOpenChange={(o) => !o && close()}
        title="سابقهٔ آبیاری"
        description={dialog?.type === 'history' ? dialog.item.name : undefined}
      >
        {dialog?.type === 'history' && <WateringHistory plantId={dialog.item.id} />}
      </FormDialog>

      <ConfirmDialog
        open={dialog?.type === 'delete'}
        onOpenChange={(o) => !o && close()}
        title="حذف گیاه؟"
        description={dialog?.type === 'delete' ? `«${dialog.item.name}» و سابقهٔ آبیاری آن برای همیشه حذف می‌شود.` : ''}
        onConfirm={() => dialog?.type === 'delete' && void save(plantRepo.remove(dialog.item.id), 'گیاه حذف شد.')}
      />
    </>
  )
}
