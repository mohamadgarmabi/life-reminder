import { useState } from 'react'
import { toast } from '#/components/sonner'
import { formatDayMonth, relativeDay } from '#/modules/shell/utils/format'
import { cn } from '#/modules/shell/utils/cn'
import { t } from '#/modules/shell/utils/i18n'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import type { CareKind, PlantCardProps } from '#/modules/plants/types'
import {
  daysUntilWatering,
  nextMistingDate,
  nextWateringDate,
  wateringEveryLabel,
} from '#/modules/plants/utils/schedule'

const usePlantCard = ({ plant, today }: Pick<PlantCardProps, 'plant' | 'today'>) => {
  const [busy, setBusy] = useState(false)
  const days = daysUntilWatering(plant, today)
  const next = nextWateringDate(plant)
  const wateredToday = plant.lastWateredAt === today
  const nextMist = nextMistingDate(plant)
  const mistedToday = plant.lastMistedAt === today

  const log = async (kind: CareKind) => {
    setBusy(true)
    try {
      const added = await plantRepo.logCare(plant.id, kind)
      const water = kind === 'water'
      if (added) toast.success(t(water ? 'plants.wateredToast' : 'plants.mistedToast', { name: plant.name }))
      else toast.info(t(water ? 'plants.alreadyWatered' : 'plants.alreadyMisted'))
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
      'min-w-0 flex-1 text-xs @xs:h-9 @xs:text-sm',
      (days > 0 || wateredToday) && 'bg-primary/10 text-primary hover:bg-primary/15',
    ),
    wateredToday,
    waterDisabled: busy || wateredToday,
    waterLabel: wateredToday ? t('plants.wateredToday') : t('plants.water'),
    water: () => void log('water'),
    hasMisting: !!nextMist,
    mistLabel: mistedToday ? t('plants.mistedToday') : t('plants.mist'),
    mistStatusLabel: nextMist
      ? nextMist < today
        ? t('plants.mistOverdue', { relative: relativeDay(nextMist) })
        : t('plants.nextMisting', { relative: relativeDay(nextMist) })
      : '',
    mistClassName: cn(
      'shrink-0 @xs:size-9',
      (!nextMist || nextMist > today || mistedToday) && 'bg-primary/10 text-primary hover:bg-primary/15',
    ),
    mistDisabled: busy || mistedToday,
    mist: () => void log('mist'),
  }
}

export { usePlantCard }
