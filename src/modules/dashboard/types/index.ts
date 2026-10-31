import type { LucideIcon } from 'lucide-react'
import type { Installment } from '#/modules/installments/types'
import type { IsoDate } from '#/modules/shell/types'

interface AgendaItem {
  key: string
  kind: 'installment' | 'plant' | 'reminder'
  title: string
  day: IsoDate
  /** Exact time for reminders; date-only items sort at the start of their day. */
  at: Date | null
  installment?: Installment
}

interface Agenda {
  overdue: AgendaItem[]
  today: AgendaItem[]
  upcoming: AgendaItem[]
}

type AgendaRoute = '/installments' | '/plants' | '/reminders'

interface AgendaKindMeta {
  icon: LucideIcon
  to: AgendaRoute
  label: string
}

interface QuickActionProps {
  to: AgendaRoute
  icon: LucideIcon
  label: string
}

interface StatProps {
  label: string
  value: number
  tone?: 'danger'
}

interface AgendaSectionProps {
  title: string
  items: AgendaItem[]
  now: Date
  empty?: string
  danger?: boolean
}

export type { AgendaItem, Agenda, AgendaRoute, AgendaKindMeta, QuickActionProps, StatProps, AgendaSectionProps }
