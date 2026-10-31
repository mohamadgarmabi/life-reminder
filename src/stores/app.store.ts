import { createStore } from '@tanstack/react-store'

export type DbStatus =
  | { state: 'opening' }
  | { state: 'ready'; persisted: boolean | null }
  | { state: 'error'; message: string }

/** Transient, non-persisted application state. */
export const appStore = createStore({
  db: { state: 'opening' } as DbStatus,
  /** store name → number of records that failed validation (kept on disk, hidden from UI). */
  invalidRecords: {} as Record<string, number>,
})
