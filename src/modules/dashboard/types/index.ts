import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Installment } from '#/modules/installments/types'
import type { IsoDate } from '#/modules/shell/types'
import type { Settings } from '#/modules/settings/types'

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
  to: AgendaRoute | '/plans'
  icon: LucideIcon
  label: string
}

interface AgendaSectionProps {
  title: string
  items: AgendaItem[]
  now: Date
  empty?: string
  danger?: boolean
}

type WidgetConfig = Settings['widgets'][number]
type WidgetId = WidgetConfig['id']
type WidgetSize = WidgetConfig['size']

interface WidgetProps {
  config: WidgetConfig
  editing: boolean
  onMove: (from: WidgetId, to: WidgetId) => void
  onToggleSize: (id: WidgetId) => void
  onLongPress: () => void
  children: ReactNode
}

interface AgendaWidgetProps extends AgendaSectionProps {
  size: WidgetSize
  icon: LucideIcon
}

export type {
  AgendaItem,
  Agenda,
  AgendaRoute,
  AgendaKindMeta,
  QuickActionProps,
  AgendaSectionProps,
  WidgetConfig,
  WidgetId,
  WidgetSize,
  WidgetProps,
  AgendaWidgetProps,
}
