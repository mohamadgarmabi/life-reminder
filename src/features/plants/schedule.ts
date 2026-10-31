import { addDaysIso, daysBetween, type IsoDate } from '#/lib/dates'
import type { Plant } from './schema'

export const nextWateringDate = (p: Pick<Plant, 'lastWateredAt' | 'wateringIntervalDays'>): IsoDate =>
  addDaysIso(p.lastWateredAt, p.wateringIntervalDays)

/** Negative = overdue by that many days, 0 = water today. */
export const daysUntilWatering = (p: Plant, today: IsoDate) => daysBetween(today, nextWateringDate(p))
