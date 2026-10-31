import { IDBFactory } from 'fake-indexeddb'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDbForTests } from '#/modules/database/apis/database.api'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import type { Installment } from '#/modules/installments/types'
import type { Plant } from '#/modules/plants/types'
import type { Reminder } from '#/modules/reminders/types'
import { updateSettings } from '#/modules/settings/stores/settings.store'
import { collectCandidates, runReminderCheck } from '#/modules/notifications/utils/reminder-engine'

const shown = vi.hoisted(() => [] as { title: string }[])
vi.mock('#/modules/notifications/apis/notifications.api', () => ({
  permissionStatus: () => 'granted',
  showNotification: async (n: { title: string }) => void shown.push(n),
}))

const ts = '2026-10-01T00:00:00.000Z'
const installment: Installment = {
  id: 'i1',
  title: 'وام',
  amount: 1_000_000,
  currency: 'IRT',
  dueDay: 10,
  startDate: '2026-10-07', // first due: 1405/08/10 = 2026-11-01
  totalPayments: 12,
  paidPayments: 0,
  reminderDaysBefore: [3, 1],
  notes: null,
  isActive: true,
  createdAt: ts,
  updatedAt: ts,
}
const plant: Plant = {
  id: 'p1',
  name: 'پوتوس',
  image: null,
  wateringIntervalDays: 3,
  lastWateredAt: '2026-10-28',
  notes: null,
  createdAt: ts,
  updatedAt: ts,
}
const reminder: Reminder = {
  id: 'r1',
  title: 'قرص',
  description: null,
  scheduledAt: new Date(2026, 9, 31, 8).toISOString(),
  recurrence: 'daily',
  isCompleted: false,
  completedThrough: null,
  snoozedUntil: null,
  createdAt: ts,
  updatedAt: ts,
}
const data = { installments: [installment], plants: [plant], reminders: [reminder] }

describe('collectCandidates', () => {
  it('returns nothing before anything is due', () => {
    expect(collectCandidates(data, '09:00', new Date(2026, 9, 27, 12))).toEqual([])
  })

  it('fires installment lead-time reminders at the default time', () => {
    expect(collectCandidates(data, '09:00', new Date(2026, 9, 29, 8, 59))).toEqual([])
    const [c] = collectCandidates(data, '09:00', new Date(2026, 9, 29, 9, 0))
    expect(c.keys).toEqual(['installment:i1:0:3'])
  })

  it('collapses missed lead times of one payment into a single notification', () => {
    const list = collectCandidates({ ...data, plants: [], reminders: [] }, '09:00', new Date(2026, 10, 2))
    expect(list).toHaveLength(1)
    expect(list[0].keys.sort()).toEqual(['installment:i1:0:0', 'installment:i1:0:1', 'installment:i1:0:3'])
  })

  it('includes overdue plants and reminders, honouring snooze', () => {
    const now = new Date(2026, 9, 31, 10)
    const noInst = { ...data, installments: [] }
    expect(
      collectCandidates(noInst, '09:00', now)
        .map((c) => c.tag)
        .sort(),
    ).toEqual(['plant:p1', 'reminder:r1'])
    const snoozed = { ...reminder, snoozedUntil: new Date(2026, 9, 31, 11).toISOString() }
    expect(collectCandidates({ ...noInst, reminders: [snoozed] }, '09:00', now).map((c) => c.tag)).toEqual(['plant:p1'])
  })

  it('skips paused and fully paid installments', () => {
    const now = new Date(2026, 10, 5)
    const paused = { ...installment, isActive: false }
    const paid = { ...installment, paidPayments: 12 }
    expect(collectCandidates({ installments: [paused, paid], plants: [], reminders: [] }, '09:00', now)).toEqual([])
  })
})

describe('runReminderCheck', () => {
  beforeEach(async () => {
    await resetDbForTests()
    globalThis.indexedDB = new IDBFactory()
    shown.length = 0
    updateSettings({ notificationsEnabled: true, defaultReminderTime: '09:00' })
  })

  it('delivers each notification once, even when checks overlap', async () => {
    const { id: _id, createdAt: _c, updatedAt: _u, currency: _cur, ...values } = installment
    await installmentRepo.create({ ...values, notes: '' })
    const now = new Date(2026, 9, 31, 10)
    await Promise.all([runReminderCheck(now), runReminderCheck(now)])
    await runReminderCheck(now)
    expect(shown.map((n) => n.title)).toEqual(['قسط وام'])
  })

  it('does nothing when disabled', async () => {
    updateSettings({ notificationsEnabled: false })
    const { id: _id, createdAt: _c, updatedAt: _u, currency: _cur, ...values } = installment
    await installmentRepo.create({ ...values, notes: '' })
    await runReminderCheck(new Date(2026, 9, 31, 10))
    expect(shown).toEqual([])
  })
})
