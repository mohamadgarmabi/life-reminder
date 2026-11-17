import { useState } from 'react'
import { toast } from '#/components/sonner'
import { formatDayMonth, relativeDay } from '#/modules/shell/utils/format'
import { cn } from '#/modules/shell/utils/cn'
import { t } from '#/modules/shell/utils/i18n'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import type { PlantCardProps } from '#/modules/plants/types'
import { daysUntilWatering, nextWateringDate, wateringEveryLabel } from '#/modules/plants/utils/schedule'

const usePlantCard = ({ plant, today }: Pick<PlantCardProps, 'plant' | 'today'>) => {
  const [busy, setBusy] = useState(false)
  const days = daysUntilWatering(plant, today)
  const next = nextWateringDate(plant)
  const wateredToday = plant.lastWateredAt === today

  const water = async () => {
    setBusy(true)
    try {
      const added = await plantRepo.markWatered(plant.id)
      if (added) toast.success(t('plants.wateredToast', { name: plant.name }))
      else toast.info(t('plants.alreadyWatered'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('plants.saveError'))
    } finally {
      setBusy(false)
    }
  }

  return {
    image: plant.image,
    menuLabel: t('plants.options', { name: plant.name }),
    intervalLabel: wateringEveryLabel(plant.wateringIntervalDays),
    statusClassName: cn(
      'line-clamp-2 text-xs leading-5 @xs:line-clamp-1 @xs:text-sm',
      days < 0 ? 'font-medium text-destructive' : days === 0 ? 'font-medium text-primary' : 'text-muted-foreground',
    ),
    statusLabel:
      days < 0
        ? t('plants.overdue', { relative: relativeDay(next) })
        : t('plants.nextWatering', { relative: relativeDay(next), date: formatDayMonth(next) }),
    waterClassName: cn(
      'mt-auto w-full min-w-0 text-xs @xs:h-9 @xs:text-sm',
      (days > 0 || wateredToday) && 'bg-primary/10 text-primary hover:bg-primary/15',
    ),
    wateredToday,
    waterDisabled: busy || wateredToday,
    waterLabel: wateredToday ? t('plants.wateredToday') : t('plants.water'),
    water,
  }
}

export { usePlantCard }
