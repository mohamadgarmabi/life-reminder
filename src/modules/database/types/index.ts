import type { DBSchema, IDBPDatabase } from 'idb'
import type { DATA_STORES } from '#/modules/database/utils/database.schema'
import type { Installment, Payment } from '#/modules/installments/types'
import type { Plant, Watering } from '#/modules/plants/types'
import type { Plan } from '#/modules/plans/types'
import type { Reminder, ReminderEvent } from '#/modules/reminders/types'

interface LedgerEntry {
  /** e.g. "installment:<id>:<paymentIndex>:<daysBefore>" — one notification per key, ever. */
  key: string
  firedAt: string
}

/** A notification that was shown — kept after it leaves the tray. Written by the app and the service worker. */
interface NotificationHistoryEntry {
  id: string
  title: string
  body: string
  url: string
  at: string
}

interface LifeDB extends DBSchema {
  installments: { key: string; value: Installment }
  payments: {
    key: string
    value: Payment
    indexes: { byInstallment: string; byInstallmentIndex: [string, number] }
  }
  plants: { key: string; value: Plant }
  waterings: {
    key: string
    value: Watering
    indexes: {
      byPlant: string
      /** Removed in v4 — named here only so the v1 migration that created it still type-checks. */
      byPlantDate: [string, string]
      byPlantKindDate: [string, string, string]
    }
  }
  reminders: { key: string; value: Reminder }
  reminderEvents: { key: string; value: ReminderEvent; indexes: { byReminder: string } }
  plans: { key: string; value: Plan }
  notificationLedger: { key: string; value: LedgerEntry; indexes: { byFiredAt: string } }
  notificationHistory: { key: string; value: NotificationHistoryEntry; indexes: { byAt: string } }
  /** "<store>:<id>" → hash of the record as last synced with the account; absent = never synced. */
  syncState: { key: string; value: { key: string; hash: string } }
}

type DataStore = (typeof DATA_STORES)[number]

type Db = IDBPDatabase<LifeDB>

type LiveQuery<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: Error }

export type { LedgerEntry, NotificationHistoryEntry, LifeDB, DataStore, Db, LiveQuery }
