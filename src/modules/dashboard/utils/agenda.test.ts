import { describe, expect, it } from 'vitest'
import type { Plant } from '#/modules/plants/types'
import type { Reminder } from '#/modules/reminders/types'
import { buildAgenda } from '#/modules/dashboard/utils/agenda'

const ts = '2026-10-01T00:00:00.000Z'
const plant = (id: string, lastWateredAt: string): Plant => ({
  id,
  name: id,
  image: null,
  wateringIntervalDays: 2,
  lastWateredAt,
  notes: null,
  createdAt: ts,
  updatedAt: ts,
})
const reminder = (id: string, at: Date): Reminder => ({
  id,
  title: id,
  description: null,
  scheduledAt: at.toISOString(),
  recurrence: 'none',
  isCompleted: false,
  completedThrough: null,
  snoozedUntil: null,
  createdAt: ts,
  updatedAt: ts,
})

describe('buildAgenda', () => {
  it('groups into overdue, today and upcoming', () => {
    const now = new Date(2026, 9, 31, 12)
    const agenda = buildAgenda(
      {
        installments: [],
        plants: [
          plant('late', '2026-10-27'),
          plant('today', '2026-10-29'),
          plant('soon', '2026-10-31'),
          plant('far', '2026-12-01'),
        ],
        reminders: [reminder('earlier', new Date(2026, 9, 31, 8)), reminder('later', new Date(2026, 9, 31, 20))],
      },
      now,
    )
    expect(agenda.overdue.map((i) => i.title)).toEqual(['late', 'earlier'])
    expect(agenda.today.map((i) => i.title)).toEqual(['today', 'later'])
    expect(agenda.upcoming.map((i) => i.title)).toEqual(['soon'])
  })
})
