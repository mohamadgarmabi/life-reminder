import { describe, expect, it } from 'vitest'
import type { Plant } from '#/modules/plants/types'
import { daysUntilWatering, nextWateringDate } from '#/modules/plants/utils/schedule'

const plant = (over: Partial<Plant>): Plant => ({
  id: 'p1',
  name: 'پوتوس',
  image: null,
  wateringIntervalDays: 3,
  lastWateredAt: '2026-10-28',
  notes: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  ...over,
})

describe('watering schedule', () => {
  it('adds the interval to the last watering day', () => {
    expect(nextWateringDate(plant({}))).toBe('2026-10-31')
    expect(nextWateringDate(plant({ lastWateredAt: '2026-10-30', wateringIntervalDays: 7 }))).toBe('2026-11-06')
  })

  it('crosses month and year boundaries', () => {
    expect(nextWateringDate(plant({ lastWateredAt: '2026-12-30', wateringIntervalDays: 5 }))).toBe('2027-01-04')
  })

  it('reports days until (negative when overdue)', () => {
    expect(daysUntilWatering(plant({}), '2026-10-31')).toBe(0)
    expect(daysUntilWatering(plant({}), '2026-11-02')).toBe(-2)
    expect(daysUntilWatering(plant({}), '2026-10-29')).toBe(2)
  })
})
