const DB_NAME = 'life-reminder'

/** Stores that hold user data and are included in export/import. */
const DATA_STORES = ['installments', 'payments', 'plants', 'waterings', 'reminders', 'reminderEvents'] as const

export { DB_NAME, DATA_STORES }
