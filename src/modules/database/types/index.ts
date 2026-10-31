import type { DBSchema, IDBPDatabase } from 'idb'
import type { DATA_STORES } from '#/modules/database/utils/database.schema'
import type { Installment, Payment } from '#/modules/installments/types'
import type { Plant, Watering } from '#/modules/plants/types'
import type { Reminder, ReminderEvent } from '#/modules/reminders/types'

interface LedgerEntry {
  /** e.g. "installment:<id>:<paymentIndex>:<daysBefore>" — one notification per key, ever. */
  key: string
  firedAt: string
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
    indexes: { byPlant: string; byPlantDate: [string, string] }
  }
  reminders: { key: string; value: Reminder }
  reminderEvents: { key: string; value: ReminderEvent; indexes: { byReminder: string } }
  notificationLedger: { key: string; value: LedgerEntry; indexes: { byFiredAt: string } }
}

type DataStore = (typeof DATA_STORES)[number]

type Db = IDBPDatabase<LifeDB>

type LiveQuery<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: Error }

export type { LedgerEntry, LifeDB, DataStore, Db, LiveQuery }
