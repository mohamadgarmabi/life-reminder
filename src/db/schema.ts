import type { DBSchema } from 'idb'
import type { Installment, Payment } from '#/features/installments/schema'
import type { Plant, Watering } from '#/features/plants/schema'
import type { Reminder, ReminderEvent } from '#/features/reminders/schema'

export const DB_NAME = 'life-reminder'

export interface LedgerEntry {
  /** e.g. "installment:<id>:<paymentIndex>:<daysBefore>" — one notification per key, ever. */
  key: string
  firedAt: string
}

export interface LifeDB extends DBSchema {
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

/** Stores that hold user data and are included in export/import. */
export const DATA_STORES = [
  'installments',
  'payments',
  'plants',
  'waterings',
  'reminders',
  'reminderEvents',
] as const
export type DataStore = (typeof DATA_STORES)[number]
