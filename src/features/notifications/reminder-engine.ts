import { subscribeDbChange } from '#/db/live'
import { installmentRepo } from '#/features/installments/repository'
import type { Installment } from '#/features/installments/schema'
import { nextPayment } from '#/features/installments/schedule'
import { plantRepo } from '#/features/plants/repository'
import type { Plant } from '#/features/plants/schema'
import { nextWateringDate } from '#/features/plants/schedule'
import { reminderRepo } from '#/features/reminders/repository'
import type { Reminder } from '#/features/reminders/schema'
import { dueAt } from '#/features/reminders/schedule'
import { addDaysIso, atTime } from '#/lib/dates'
import { formatDate, formatDateTime, formatMoney, relativeDay, toFaDigits } from '#/lib/format'
import { settingsStore } from '#/stores/settings.store'
import { claimKeys, pruneLedger } from './notification-ledger'
import { permissionStatus, showNotification, type AppNotification } from './notification-service'

export interface Candidate extends AppNotification {
  fireAt: Date
  /** Every ledger key this notification covers; claiming any of them suppresses the rest too. */
  keys: string[]
}

interface Data {
  installments: Installment[]
  plants: Plant[]
  reminders: Reminder[]
}

/** Notifications that are due at `now` (including missed ones). Pure, so it is unit-tested. */
export function collectCandidates(data: Data, defaultTime: string, now: Date): Candidate[] {
  const out: Candidate[] = []

  for (const inst of data.installments) {
    const next = inst.isActive ? nextPayment(inst) : null
    if (!next) continue
    const leads = [...new Set([...inst.reminderDaysBefore, 0])].sort((a, b) => a - b)
    const due = leads
      .map((d) => ({ d, fireAt: atTime(addDaysIso(next.dueDate, -d), defaultTime) }))
      .filter((l) => l.fireAt <= now)
    if (!due.length) continue
    // If several lead times were missed, show only the most recent one.
    const latest = due[0]
    out.push({
      keys: due.map((l) => `installment:${inst.id}:${next.index}:${l.d}`),
      fireAt: latest.fireAt,
      tag: `installment:${inst.id}`,
      path: '/installments',
      title: `قسط ${inst.title}`,
      body: `${formatMoney(inst.amount, inst.currency)} — سررسید ${relativeDay(next.dueDate, now)} (${formatDate(next.dueDate)})`,
    })
  }

  for (const plant of data.plants) {
    const next = nextWateringDate(plant)
    const fireAt = atTime(next, defaultTime)
    if (fireAt > now) continue
    out.push({
      keys: [`plant:${plant.id}:${next}`],
      fireAt,
      tag: `plant:${plant.id}`,
      path: '/plants',
      title: `آبیاری ${plant.name}`,
      body: `هر ${toFaDigits(plant.wateringIntervalDays)} روز — موعد آبیاری ${relativeDay(next, now)}`,
    })
  }

  for (const r of data.reminders) {
    const at = dueAt(r)
    if (!at || at > now) continue
    out.push({
      keys: [`reminder:${r.id}:${at.toISOString()}`],
      fireAt: at,
      tag: `reminder:${r.id}`,
      path: '/reminders',
      title: r.title,
      body: r.description ?? formatDateTime(at),
    })
  }

  return out.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime())
}

const SUMMARY_THRESHOLD = 3

/** Shows due, not-yet-delivered notifications. Safe to call often and from several tabs. */
export async function runReminderCheck(now: Date = new Date()) {
  const { notificationsEnabled, defaultReminderTime } = settingsStore.state
  if (!notificationsEnabled || permissionStatus() !== 'granted') return

  const [installments, plants, reminders] = await Promise.all([
    installmentRepo.list(),
    plantRepo.list(),
    reminderRepo.list(),
  ])
  const candidates = collectCandidates({ installments, plants, reminders }, defaultReminderTime, now)
  if (!candidates.length) return

  const claimed = await claimKeys(candidates.flatMap((c) => c.keys), now)
  const fresh = candidates.filter((c) => c.keys.some((k) => claimed.has(k)))

  if (fresh.length > SUMMARY_THRESHOLD) {
    // Opening the app after a long time shouldn't produce a burst of notifications.
    await showNotification({
      title: 'یادآورهای معوق',
      body: `${toFaDigits(fresh.length)} مورد در انتظار شماست`,
      tag: 'summary',
      path: '/',
    })
    return
  }
  for (const c of fresh) await showNotification(c)
}

const CHECK_INTERVAL_MS = 60_000

/**
 * Checks while the app is open: on start, every minute, when the tab becomes visible, and after
 * data changes. Browsers give pages no way to wake up at a set time when closed (see settings page).
 */
export function startReminderEngine(): () => void {
  const check = () => void runReminderCheck().catch((e: unknown) => console.error('reminder check failed', e))
  const onVisible = () => document.visibilityState === 'visible' && check()

  check()
  void pruneLedger(new Date(Date.now() - 400 * 86_400_000)).catch(() => {})
  const timer = setInterval(check, CHECK_INTERVAL_MS)
  document.addEventListener('visibilitychange', onVisible)
  const unsubscribe = subscribeDbChange(check)
  return () => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisible)
    unsubscribe()
  }
}
