import { createStore } from '@tanstack/react-store'
import type { DbStatus } from '#/modules/shell/types'

/** Transient, non-persisted application state. */
const appStore = createStore({
  db: { state: 'opening' } as DbStatus,
  /** store name → number of records that failed validation (kept on disk, hidden from UI). */
  invalidRecords: {} as Record<string, number>,
})

export { appStore }
