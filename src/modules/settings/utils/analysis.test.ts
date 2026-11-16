import { describe, expect, it } from 'vitest'
import type { Agenda, AgendaItem } from '#/modules/dashboard/types'
import { buildAnalysisSnapshot, nearestItem } from '#/modules/settings/utils/analysis'

const NOW = new Date(2026, 10, 16, 10)
const item = (kind: AgendaItem['kind'], title: string, day: AgendaItem['day']): AgendaItem => ({
  key: `${kind}:${title}`,
  kind,
  title,
  day,
  at: null,
})
const EMPTY: Agenda = { overdue: [], today: [], upcoming: [] }

describe('analysis', () => {
  it('picks overdue before today and upcoming, linking to its page', () => {
    const agenda = {
      overdue: [item('plant', 'پوتوس', '2026-11-14')],
      today: [item('reminder', 'دکتر', '2026-11-16')],
      upcoming: [],
    }
    expect(nearestItem(agenda, NOW)?.to).toBe('/plants')
    expect(nearestItem({ ...agenda, overdue: [] }, NOW)?.to).toBe('/reminders')
    expect(nearestItem(EMPTY, NOW)).toBeNull()
  })

  it('says each empty area is empty instead of leaving it out', () => {
    const text = buildAnalysisSnapshot(
      { installments: [], plants: [], plans: [], agenda: EMPTY, prices: null, year: 1405 },
      NOW,
    )
    for (const s of ['قسط فعالی نیست', 'دلار: نامشخص', 'گیاهی ثبت نشده', 'یادآوری برای این هفته نیست'])
      expect(text).toContain(s)
  })
})
