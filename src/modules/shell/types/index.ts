import type { LucideIcon } from 'lucide-react'
import type { MessageKey } from '#/modules/shell/utils/i18n'

type DbStatus =
  { state: 'opening' } | { state: 'ready'; persisted: boolean | null } | { state: 'error'; message: string }

/**
 * Storage formats:
 * - IsoDate  "YYYY-MM-DD": a Gregorian calendar date with no time/zone (due dates, watering days).
 *   Kept zone-free so a timezone change never shifts which day something is due.
 * - ISO datetime "...Z": an absolute instant (reminder times, createdAt, payment timestamps).
 */
type IsoDate = string

interface NavItem {
  to: '/' | '/installments' | '/plans' | '/plants' | '/reminders' | '/settings'
  label: MessageKey
  icon: LucideIcon
}

interface SelectOption<T> {
  value: T
  label: string
}

export type { DbStatus, IsoDate, NavItem, SelectOption }
