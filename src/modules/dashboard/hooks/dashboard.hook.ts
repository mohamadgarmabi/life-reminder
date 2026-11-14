import { useSelector } from '@tanstack/react-store'
import { useState } from 'react'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import type { WidgetId } from '#/modules/dashboard/types'
import { buildAgenda } from '#/modules/dashboard/utils/agenda'
import { moveWidget, toggleWidgetSize, withAllWidgets } from '#/modules/dashboard/utils/widgets'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import { planRepo } from '#/modules/plans/apis/plans.api'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import { reminderRepo } from '#/modules/reminders/apis/reminders.api'
import { settingsStore, updateSettings } from '#/modules/settings/stores/settings.store'
import { formatDateLong, toFaDigits } from '#/modules/shell/utils/format'
import { useNow } from '#/modules/shell/hooks/now.hook'
import { usePrices } from '#/modules/dashboard/hooks/prices.hook'

const currentWidgets = () => withAllWidgets(settingsStore.state.widgets)

const useDashboard = () => {
  const now = useNow()
  const widgets = withAllWidgets(useSelector(settingsStore, (s) => s.widgets))
  const [editing, setEditing] = useState(false)
  const market = usePrices()
  const q = useLiveQuery(async () => {
    const [installments, plants, reminders, plans] = await Promise.all([
      installmentRepo.list(),
      plantRepo.list(),
      reminderRepo.list(),
      planRepo.list(),
    ])
    return { installments, plants, reminders, plans }
  })
  const agenda = q.data ? buildAgenda(q.data, now) : null

  return {
    now,
    dateLabel: formatDateLong(now),
    error: q.status === 'error' ? q.error : null,
    agenda,
    plants: q.data?.plants,
    plans: q.data?.plans,
    summary: agenda
      ? `${toFaDigits(agenda.today.length)} کار امروز · ${toFaDigits(agenda.overdue.length)} معوق`
      : undefined,
    market,
    widgets,
    editing,
    toggleEditing: () => setEditing((e) => !e),
    startEditing: () => setEditing(true),
    handleMove: (from: WidgetId, to: WidgetId) => updateSettings({ widgets: moveWidget(currentWidgets(), from, to) }),
    handleToggleSize: (id: WidgetId) => updateSettings({ widgets: toggleWidgetSize(currentWidgets(), id) }),
  }
}

export { useDashboard }
