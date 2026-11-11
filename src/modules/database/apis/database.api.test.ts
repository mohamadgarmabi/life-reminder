import { IDBFactory } from 'fake-indexeddb'
import { beforeEach, describe, expect, it } from 'vitest'
import { exportData, importData, parseBackup } from '#/modules/settings/apis/backup.api'
import { installmentRepo, PaymentConflictError } from '#/modules/installments/apis/installments.api'
import type { InstallmentFormValues } from '#/modules/installments/types'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import { planRepo } from '#/modules/plans/apis/plans.api'
import { reminderRepo } from '#/modules/reminders/apis/reminders.api'
import { pendingOccurrence } from '#/modules/reminders/utils/schedule'
import { appStore } from '#/modules/shell/stores/shell.store'
import { getDb, resetDbForTests } from '#/modules/database/apis/database.api'

const installmentValues: InstallmentFormValues = {
  title: 'وام مسکن',
  amount: 5_000_000,
  dueDay: 10,
  startDate: '2026-10-07',
  totalPayments: 3,
  paidPayments: 0,
  reminderDaysBefore: [1],
  tags: [],
  notes: '',
  isActive: true,
}

beforeEach(async () => {
  await resetDbForTests()
  globalThis.indexedDB = new IDBFactory()
})

describe('installments', () => {
  it('persists across connections (reload)', async () => {
    const created = await installmentRepo.create(installmentValues)
    await resetDbForTests() // simulates a page reload: new connection, same storage
    expect(await installmentRepo.list()).toEqual([created])
  })

  it('updates without touching paid count, and deletes with payment history', async () => {
    const { id } = await installmentRepo.create(installmentValues)
    await installmentRepo.markPaid(id, 0)
    const updated = await installmentRepo.update(id, { ...installmentValues, title: 'وام خودرو' })
    expect(updated.title).toBe('وام خودرو')
    expect(updated.paidPayments).toBe(1)
    await installmentRepo.remove(id)
    expect(await installmentRepo.list()).toEqual([])
    expect(await installmentRepo.payments(id)).toEqual([])
  })

  it('never records the same payment twice', async () => {
    const { id } = await installmentRepo.create(installmentValues)
    const results = await Promise.allSettled([installmentRepo.markPaid(id, 0), installmentRepo.markPaid(id, 0)])
    expect(results.map((r) => r.status).sort()).toEqual(['fulfilled', 'rejected'])
    expect(results.find((r) => r.status === 'rejected')).toMatchObject({ reason: expect.any(PaymentConflictError) })
    const payments = await installmentRepo.payments(id)
    expect(payments).toHaveLength(1)
    expect(payments[0]).toMatchObject({ index: 0, dueDate: '2026-11-01', amount: 5_000_000 })
    expect((await installmentRepo.list())[0].paidPayments).toBe(1)
  })

  it('refuses payments beyond the total and can undo the last one', async () => {
    const { id } = await installmentRepo.create({ ...installmentValues, totalPayments: 1 })
    const p = await installmentRepo.markPaid(id, 0)
    await expect(installmentRepo.markPaid(id, 1)).rejects.toBeInstanceOf(PaymentConflictError)
    await installmentRepo.undoPayment(p.id)
    expect((await installmentRepo.list())[0].paidPayments).toBe(0)
    expect(await installmentRepo.payments(id)).toEqual([])
  })
})

describe('plants', () => {
  it('records one watering per day and advances lastWateredAt', async () => {
    const plant = await plantRepo.create({
      name: 'پوتوس',
      image: null,
      wateringIntervalDays: 3,
      lastWateredAt: '2026-10-20',
      notes: '',
    })
    const now = new Date(2026, 9, 31, 10)
    expect(await plantRepo.markWatered(plant.id, now)).toBe(true)
    expect(await plantRepo.markWatered(plant.id, now)).toBe(false)
    expect(await plantRepo.waterings(plant.id)).toHaveLength(1)
    expect((await plantRepo.list())[0].lastWateredAt).toBe('2026-10-31')
  })
})

describe('reminders', () => {
  it('completes, ignores stale completion, and snoozes with history', async () => {
    const r = await reminderRepo.create({
      title: 'قرص',
      description: '',
      date: '2026-10-30',
      time: '08:00',
      recurrence: 'daily',
    })
    const occ = r.scheduledAt
    const now = new Date(2026, 9, 31, 9)
    expect(await reminderRepo.complete(r.id, occ, now)).toBe(true)
    expect(await reminderRepo.complete(r.id, occ, now)).toBe(false) // double tap
    const [after] = await reminderRepo.list()
    expect(pendingOccurrence(after)).toEqual(new Date(2026, 10, 1, 8))

    await reminderRepo.snooze(r.id, new Date(2026, 10, 1, 9), now)
    expect((await reminderRepo.list())[0].snoozedUntil).toBe(new Date(2026, 10, 1, 9).toISOString())
    expect((await reminderRepo.events(r.id)).map((e) => e.type).sort()).toEqual(['completed', 'snoozed'])
  })
})

describe('corrupted records', () => {
  it('hides invalid records from the UI but keeps and exports them', async () => {
    await installmentRepo.create(installmentValues)
    const db = await getDb()
    // Simulate a corrupted row written by a buggy older version.
    await db.put('installments', { id: 'broken', title: 42 } as never)
    expect(await installmentRepo.list()).toHaveLength(1)
    expect(appStore.state.invalidRecords.installments).toBe(1)
    const exported = JSON.parse(await exportData())
    expect(exported.data.installments).toHaveLength(2)
  })
})

describe('backup', () => {
  it('round-trips export → import', async () => {
    const inst = await installmentRepo.create(installmentValues)
    await installmentRepo.markPaid(inst.id, 0)
    const json = await exportData()

    globalThis.indexedDB = new IDBFactory()
    await resetDbForTests()
    const parsed = parseBackup(json)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    await importData(parsed.backup)
    expect((await installmentRepo.list())[0]).toMatchObject({ id: inst.id, paidPayments: 1 })
    expect(await installmentRepo.payments(inst.id)).toHaveLength(1)
  })

  it('rejects invalid files', () => {
    expect(parseBackup('not json')).toMatchObject({ ok: false })
    expect(parseBackup('{"app":"other"}')).toMatchObject({ ok: false })
    expect(
      parseBackup(JSON.stringify({ app: 'life-reminder', schemaVersion: 1, exportedAt: 'x', data: {} })),
    ).toMatchObject({ ok: false })
  })

  it('leaves existing data untouched when an import fails midway', async () => {
    const existing = await installmentRepo.create(installmentValues)
    const parsed = parseBackup(await exportData())
    if (!parsed.ok) throw new Error('export should parse')
    const dupe = {
      id: 'p',
      installmentId: 'x',
      index: 0,
      dueDate: '2026-01-01',
      amount: 1,
      paidAt: '2026-01-01T00:00:00.000Z',
    }
    // Two payments for the same installment/index violate the unique index → whole import aborts.
    parsed.backup.data.payments = [dupe, { ...dupe, id: 'q' }]
    await expect(importData(parsed.backup)).rejects.toBeDefined()
    expect(await installmentRepo.list()).toEqual([existing])
  })
})

describe('plans', () => {
  it('creates, changes status, deletes and restores; survives export/import', async () => {
    const created = await planRepo.create({
      title: 'دویدن',
      description: '  ',
      year: 1405,
      status: 'planned',
      tags: ['سلامتی'],
    })
    expect(created.description).toBeNull()
    const done = await planRepo.setStatus(created.id, 'done')
    expect(done).toMatchObject({ status: 'done', title: 'دویدن', tags: ['سلامتی'] })
    const backup = parseBackup(await exportData())
    await planRepo.remove(created.id)
    expect(await planRepo.list()).toEqual([])
    await planRepo.restore(done)
    expect(await planRepo.list()).toEqual([done])
    if (!backup.ok) throw new Error(backup.error)
    await importData(backup.backup)
    expect(await planRepo.list()).toEqual([done])
  })

  it('imports old backups that have no plans', async () => {
    const backup = JSON.parse(await exportData())
    delete backup.data.plans
    const parsed = parseBackup(JSON.stringify(backup))
    expect(parsed.ok && parsed.backup.data.plans).toEqual([])
  })
})
