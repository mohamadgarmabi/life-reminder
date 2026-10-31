import type { IDBPDatabase, IDBPTransaction, StoreNames } from 'idb'
import type { LifeDB } from './schema'

type UpgradeTx = IDBPTransaction<LifeDB, StoreNames<LifeDB>[], 'versionchange'>
type Migration = (db: IDBPDatabase<LifeDB>, tx: UpgradeTx) => void

/**
 * Append-only. migrations[n] upgrades the database from version n to n+1.
 * Rules: never delete a store or rewrite records destructively; transform records in place
 * via `tx.objectStore(...)` cursors so an interrupted upgrade rolls back atomically.
 */
export const migrations: Migration[] = [
  // v0 → v1: initial schema
  (db) => {
    db.createObjectStore('installments', { keyPath: 'id' })
    const payments = db.createObjectStore('payments', { keyPath: 'id' })
    payments.createIndex('byInstallment', 'installmentId')
    payments.createIndex('byInstallmentIndex', ['installmentId', 'index'], { unique: true })

    db.createObjectStore('plants', { keyPath: 'id' })
    const waterings = db.createObjectStore('waterings', { keyPath: 'id' })
    waterings.createIndex('byPlant', 'plantId')
    waterings.createIndex('byPlantDate', ['plantId', 'date'], { unique: true })

    db.createObjectStore('reminders', { keyPath: 'id' })
    const events = db.createObjectStore('reminderEvents', { keyPath: 'id' })
    events.createIndex('byReminder', 'reminderId')

    const ledger = db.createObjectStore('notificationLedger', { keyPath: 'key' })
    ledger.createIndex('byFiredAt', 'firedAt')
  },
]

export const DB_VERSION = migrations.length

export function runMigrations(db: IDBPDatabase<LifeDB>, oldVersion: number, tx: UpgradeTx) {
  for (let v = oldVersion; v < DB_VERSION; v++) migrations[v](db, tx)
}
