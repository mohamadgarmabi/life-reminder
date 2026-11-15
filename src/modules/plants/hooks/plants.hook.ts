import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from '#/components/sonner'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import type { PlantFormValues, PlantsDialog } from '#/modules/plants/types'
import { nextWateringDate } from '#/modules/plants/utils/schedule'
import { toIsoDate } from '#/modules/shell/utils/dates'
import { toFaDigits } from '#/modules/shell/utils/format'
import { useNow } from '#/modules/shell/hooks/now.hook'

const usePlants = () => {
  const search = useSearch({ from: '/plants' })
  const navigate = useNavigate({ from: '/plants' })
  const [dialog, setDialog] = useState<PlantsDialog>(search.new ? { type: 'create' } : null)
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

  const sorted = [...(q.data ?? [])].sort((a, b) => nextWateringDate(a).localeCompare(nextWateringDate(b)))
  const thirsty = sorted.filter((p) => nextWateringDate(p) <= today).length
  const plants = sorted.map((plant) => ({
    plant,
    onEdit: () => setDialog({ type: 'edit', item: plant }),
    onHistory: () => setDialog({ type: 'history', item: plant }),
    onDelete: () => void save(plantRepo.remove(plant.id), 'گیاه حذف شد.'),
  }))
  const editingPlant = dialog?.type === 'edit' ? dialog.item : undefined
  const historyPlant = dialog?.type === 'history' ? dialog.item : undefined

  return {
    today,
    plants,
    headerDescription: sorted.length
      ? thirsty
        ? `${toFaDigits(thirsty)} گیاه امروز آب می‌خواهد`
        : 'همه سیراب‌اند'
      : undefined,
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: q.status === 'success' && !sorted.length,
    openCreate: () => setDialog({ type: 'create' }),
    handleOpenChange: (o: boolean) => {
      if (!o) close()
    },
    isFormOpen: dialog?.type === 'create' || dialog?.type === 'edit',
    formTitle: dialog?.type === 'edit' ? 'ویرایش گیاه' : 'گیاه جدید',
    isCreating: dialog?.type === 'create',
    handleCreate: (v: PlantFormValues) => save(plantRepo.create(v), 'گیاه اضافه شد.'),
    editingPlant,
    handleEdit: (v: PlantFormValues) =>
      editingPlant ? save(plantRepo.update(editingPlant.id, v), 'تغییرات ذخیره شد.') : Promise.resolve(),
    historyPlant,
    isHistoryOpen: !!historyPlant,
    historyDescription: historyPlant?.name,
  }
}

export { usePlants }
