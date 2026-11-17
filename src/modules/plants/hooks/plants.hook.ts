import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from '#/components/sonner'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import type { PlantFormValues, PlantsDialog } from '#/modules/plants/types'
import { daysUntilWatering, nextWateringDate } from '#/modules/plants/utils/schedule'
import { toIsoDate } from '#/modules/shell/utils/dates'
import { toFaDigits } from '#/modules/shell/utils/format'
import { useNow } from '#/modules/shell/hooks/now.hook'

const usePlants = () => {
  const search = useSearch({ from: '/plants' })
  const navigate = useNavigate({ from: '/plants' })
  const [filter, setFilter] = useState('all')
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
  // Bucket by days until next watering: overdue counts as today.
  const visible = sorted.filter((p) => {
    const days = daysUntilWatering(p, today)
    if (filter === 'today') return days <= 0
    if (filter === 'week') return days > 0 && days <= 7
    if (filter === 'later') return days > 7
    return true
  })
  const plants = visible.map((plant) => ({
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
    hasItems: sorted.length > 0,
    isFilterEmpty: sorted.length > 0 && !visible.length,
    filter,
    filters: [
      { value: 'all', label: 'همه' },
      { value: 'today', label: 'امروز' },
      { value: 'week', label: 'این هفته' },
      { value: 'later', label: 'بعداً' },
    ],
    handleFilterChange: setFilter,
    openCreate: () => setDialog({ type: 'create' }),
    openDoctor: () => setDialog({ type: 'doctor' }),
    isDoctorOpen: dialog?.type === 'doctor',
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
