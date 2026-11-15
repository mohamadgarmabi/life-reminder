import { useState } from 'react'
import { toast } from '#/components/sonner'
import { formatDayMonth, relativeDay, toFaDigits } from '#/modules/shell/utils/format'
import { cn } from '#/modules/shell/utils/cn'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import type { PlantCardProps } from '#/modules/plants/types'
import { daysUntilWatering, nextWateringDate } from '#/modules/plants/utils/schedule'

const usePlantCard = ({ plant, today }: Pick<PlantCardProps, 'plant' | 'today'>) => {
  const [busy, setBusy] = useState(false)
  const days = daysUntilWatering(plant, today)
  const next = nextWateringDate(plant)
  const wateredToday = plant.lastWateredAt === today

  const water = async () => {
    setBusy(true)
    try {
      const added = await plantRepo.markWatered(plant.id)
      if (added) toast.success(`${plant.name} آبیاری شد.`)
      else toast.info('آبیاری امروز قبلاً ثبت شده است.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا در ذخیره‌سازی')
    } finally {
      setBusy(false)
    }
  }

  return {
    image: plant.image,
    menuLabel: `گزینه‌های ${plant.name}`,
    intervalLabel: toFaDigits(plant.wateringIntervalDays),
    statusClassName: cn(
      'line-clamp-2 text-xs leading-5 @xs:line-clamp-1 @xs:text-sm',
      days < 0 ? 'font-medium text-destructive' : days === 0 ? 'font-medium text-primary' : 'text-muted-foreground',
    ),
    statusLabel:
      days < 0
        ? `آبیاری عقب افتاده (${relativeDay(next)})`
        : `آبیاری بعدی: ${relativeDay(next)} · ${formatDayMonth(next)}`,
    waterClassName: cn(
      'w-full min-w-0 text-xs @xs:h-9 @xs:text-sm',
      (days > 0 || wateredToday) && 'bg-primary/10 text-primary hover:bg-primary/15',
    ),
    wateredToday,
    waterDisabled: busy || wateredToday,
    waterLabel: wateredToday ? 'امروز آبیاری شد' : 'آب دادم',
    water,
  }
}

export { usePlantCard }
