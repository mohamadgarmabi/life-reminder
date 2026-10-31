import { addDaysIso, daysBetween } from '#/modules/shell/utils/dates'
import { type IsoDate } from '#/modules/shell/types'
import type { Plant } from '#/modules/plants/types'

const nextWateringDate = (p: Pick<Plant, 'lastWateredAt' | 'wateringIntervalDays'>): IsoDate =>
  addDaysIso(p.lastWateredAt, p.wateringIntervalDays)

/** Negative = overdue by that many days, 0 = water today. */
const daysUntilWatering = (p: Plant, today: IsoDate) => daysBetween(today, nextWateringDate(p))

export { nextWateringDate, daysUntilWatering }
