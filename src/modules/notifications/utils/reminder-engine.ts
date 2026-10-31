import { subscribeDbChange } from '#/modules/database/utils/live'
import { installmentRepo } from '#/modules/installments/apis/installments.api'
import type { Installment } from '#/modules/installments/types'
import { nextPayment } from '#/modules/installments/utils/schedule'
import { plantRepo } from '#/modules/plants/apis/plants.api'
import type { Plant } from '#/modules/plants/types'
import { nextWateringDate } from '#/modules/plants/utils/schedule'
import { reminderRepo } from '#/modules/reminders/apis/reminders.api'
import type { Reminder } from '#/modules/reminders/types'
import { dueAt } from '#/modules/reminders/utils/schedule'
import { addDaysIso, atTime } from '#/modules/shell/utils/dates'
import { formatDate, formatDateTime, formatMoney, relativeDay, toFaDigits } from '#/modules/shell/utils/format'
import { settingsStore } from '#/modules/settings/stores/settings.store'
import { claimKeys, pruneLedger } from '#/modules/notifications/utils/notification-ledger'
import { permissionStatus, showNotification, syncPush } from '#/modules/notifications/apis/notifications.api'
import type { Candidate } from '#/modules/notifications/types'

interface Data {
  installments: Installment[]
  plants: Plant[]
  reminders: Reminder[]
}

const collectCandidates = (data: Data, defaultTime: string, now: Date): Candidate[] => {
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

/** Every notification that will fire after `now`, each with the text it should have at its own fire time. */
const upcomingCandidates = (data: Data, defaultTime: string, now: Date): Candidate[] => {
  const times = [
    ...data.installments.flatMap((inst) => {
      const next = inst.isActive ? nextPayment(inst) : null
      return next ? [...inst.reminderDaysBefore, 0].map((d) => atTime(addDaysIso(next.dueDate, -d), defaultTime)) : []
    }),
    ...data.plants.map((p) => atTime(nextWateringDate(p), defaultTime)),
    ...data.reminders.flatMap((r) => dueAt(r) ?? []),
  ]
  const future = [...new Set(times.map((t) => t.getTime()))].filter((t) => t > now.getTime()).sort((a, b) => a - b)
  // At each fire time, the candidate that fires exactly then is what the open app would have shown.
  return future.flatMap((t) =>
    collectCandidates(data, defaultTime, new Date(t)).filter((c) => c.fireAt.getTime() === t),
  )
}

const loadData = async (): Promise<Data> => {
  const [installments, plants, reminders] = await Promise.all([
    installmentRepo.list(),
    plantRepo.list(),
    reminderRepo.list(),
  ])
  return { installments, plants, reminders }
}

const syncPushSchedule = async (now: Date = new Date()) => {
  const { notificationsEnabled, defaultReminderTime } = settingsStore.state
  if (!notificationsEnabled || permissionStatus() !== 'granted') return syncPush(null)
  await syncPush(upcomingCandidates(await loadData(), defaultReminderTime, now))
}

const SUMMARY_THRESHOLD = 3

const runReminderCheck = async (now: Date = new Date()) => {
  const { notificationsEnabled, defaultReminderTime } = settingsStore.state
  if (!notificationsEnabled || permissionStatus() !== 'granted') return

  const candidates = collectCandidates(await loadData(), defaultReminderTime, now)
  if (!candidates.length) return

  const claimed = await claimKeys(
    candidates.flatMap((c) => c.keys),
    now,
  )
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

const startReminderEngine = (): (() => void) => {
  const check = () => void runReminderCheck().catch((e: unknown) => console.error('reminder check failed', e))
  let syncTimer: ReturnType<typeof setTimeout> | undefined
  // Debounced: a burst of edits or settings changes uploads the schedule once.
  const sync = () => {
    clearTimeout(syncTimer)
    syncTimer = setTimeout(
      () => void syncPushSchedule().catch((e: unknown) => console.error('push sync failed', e)),
      1000,
    )
  }
  const onChange = () => {
    check()
    sync()
  }
  const onVisible = () => document.visibilityState === 'visible' && onChange()

  onChange()
  void pruneLedger(new Date(Date.now() - 400 * 86_400_000)).catch(() => {})
  const timer = setInterval(check, CHECK_INTERVAL_MS)
  document.addEventListener('visibilitychange', onVisible)
  const unsubscribe = subscribeDbChange(onChange)
  const settingsSub = settingsStore.subscribe(sync)
  return () => {
    clearInterval(timer)
    clearTimeout(syncTimer)
    document.removeEventListener('visibilitychange', onVisible)
    unsubscribe()
    settingsSub.unsubscribe()
  }
}

export { collectCandidates, upcomingCandidates, runReminderCheck, startReminderEngine }
