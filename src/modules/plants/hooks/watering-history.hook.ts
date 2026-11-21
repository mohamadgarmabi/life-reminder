import { revalidateLogic } from '@tanstack/react-form'
import { Droplets, SprayCan } from 'lucide-react'
import type { FormEvent } from 'react'
import { toast } from '#/components/sonner'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { useAppForm } from '#/modules/shell/components/form-fields'
import { todayIso, toIsoDate } from '#/modules/shell/utils/dates'
import { formatDateLong, formatTime, relativeDay } from '#/modules/shell/utils/format'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import { careLogSchema } from '#/modules/plants/utils/plants.schema'
import type { CareKind, CareLogValues, WateringHistoryProps } from '#/modules/plants/types'
import { t } from '#/modules/shell/utils/i18n'

const useWateringHistory = ({ plant }: WateringHistoryProps) => {
  const q = useLiveQuery(() => plantRepo.waterings(plant.id), [plant.id])
  const form = useAppForm({
    defaultValues: { kind: 'water', date: todayIso() } satisfies CareLogValues as CareLogValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: careLogSchema },
    onSubmit: async ({ value }) => {
      try {
        const added = await plantRepo.logCare(plant.id, value.kind, value.date)
        if (added) toast.success(t('plants.logged'))
        else toast.info(t('plants.alreadyLogged'))
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('plants.saveError'))
      }
    },
  })

  const rows = (q.status === 'success' ? q.data : []).map((w) => {
    const recordedAt = new Date(w.wateredAt)
    // Back-dated entries were recorded on another day, so their time of day is unknown.
    const sameDay = toIsoDate(recordedAt) === w.date
    return {
      id: w.id,
      Icon: w.kind === 'mist' ? SprayCan : Droplets,
      kindLabel: t(w.kind === 'mist' ? 'plants.kindMist' : 'plants.kindWater'),
      dateLabel: formatDateLong(w.date),
      timeLabel: sameDay
        ? t('plants.historyTime', { relative: relativeDay(w.date), time: formatTime(recordedAt) })
        : relativeDay(w.date),
    }
  })

  return {
    form,
    hasMisting: !!plant.mistingIntervalDays,
    kindOptions: [
      { value: 'water' as CareKind, label: t('plants.kindWater') },
      { value: 'mist' as CareKind, label: t('plants.kindMist') },
    ],
    handleSubmit: (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      void form.handleSubmit()
    },
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: q.status === 'success' && !rows.length,
    rows,
  }
}

export { useWateringHistory }
