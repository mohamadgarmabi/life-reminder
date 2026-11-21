import { addDaysIso, daysBetween } from '#/modules/shell/utils/dates'
import { type IsoDate } from '#/modules/shell/types'
import type { Plant } from '#/modules/plants/types'
import { toLocalDigits } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'

const nextWateringDate = (p: Pick<Plant, 'lastWateredAt' | 'wateringIntervalDays'>): IsoDate =>
  addDaysIso(p.lastWateredAt, p.wateringIntervalDays)

/** null = the plant isn't misted. */
const nextMistingDate = (p: Pick<Plant, 'lastMistedAt' | 'mistingIntervalDays'>): IsoDate | null =>
  p.mistingIntervalDays && p.lastMistedAt ? addDaysIso(p.lastMistedAt, p.mistingIntervalDays) : null

/** Negative = overdue by that many days, 0 = water today. */
const daysUntilWatering = (p: Plant, today: IsoDate) => daysBetween(today, nextWateringDate(p))

/** "Every day" / "Every 3 days". */
const wateringEveryLabel = (days: number) =>
  days === 1 ? t('plants.everyDay') : t('plants.everyDays', { n: toLocalDigits(days) })

export { nextWateringDate, nextMistingDate, daysUntilWatering, wateringEveryLabel }
