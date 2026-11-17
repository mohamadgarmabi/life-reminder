import { AlertTriangle, Bell, CalendarDays, CalendarCheck, Flower2, Target, Wallet } from 'lucide-react'
import type {
  Agenda,
  AgendaKindMeta,
  AgendaItem,
  AgendaWidgetProps,
  QuickActionProps,
  WidgetId,
} from '#/modules/dashboard/types'
import { t } from '#/modules/shell/utils/i18n'
import type { MessageKey } from '#/modules/shell/utils/i18n'

// `label` is read lazily so t() runs in the current language, never at module load; settings' analysis reads it too.
const kindMeta = (meta: Omit<AgendaKindMeta, 'label'>, key: MessageKey) =>
  Object.defineProperty(meta, 'label', { get: () => t(key), enumerable: true }) as AgendaKindMeta

const KIND: Record<AgendaItem['kind'], AgendaKindMeta> = {
  installment: kindMeta({ icon: Wallet, to: '/installments' }, 'dashboard.kind.installment'),
  plant: kindMeta({ icon: Flower2, to: '/plants' }, 'dashboard.kind.plant'),
  reminder: kindMeta({ icon: Bell, to: '/reminders' }, 'dashboard.kind.reminder'),
}

const QUICK_ACTIONS: QuickActionProps[] = [
  { to: '/installments', icon: Wallet, labelKey: 'dashboard.quick.installment' },
  { to: '/plants', icon: Flower2, labelKey: 'dashboard.quick.plant' },
  { to: '/reminders', icon: Bell, labelKey: 'dashboard.quick.reminder' },
  { to: '/plans', icon: Target, labelKey: 'dashboard.quick.plan' },
]

const AGENDA_WIDGETS: Record<keyof Agenda, Pick<AgendaWidgetProps, 'titleKey' | 'icon' | 'emptyKey' | 'danger'>> = {
  overdue: {
    titleKey: 'dashboard.agenda.overdue',
    icon: AlertTriangle,
    emptyKey: 'dashboard.agenda.overdueEmpty',
    danger: true,
  },
  today: { titleKey: 'dashboard.agenda.today', icon: CalendarCheck, emptyKey: 'dashboard.agenda.todayEmpty' },
  upcoming: { titleKey: 'dashboard.agenda.upcoming', icon: CalendarDays, emptyKey: 'dashboard.agenda.upcomingEmpty' },
}

/** Names used in edit-mode button labels. */
const WIDGET_LABEL: Record<WidgetId, MessageKey> = {
  dollar: 'dashboard.widget.dollar',
  gold: 'dashboard.widget.gold',
  date: 'dashboard.widget.date',
  quick: 'dashboard.widget.quick',
  overdue: 'dashboard.widget.overdue',
  today: 'dashboard.widget.today',
  upcoming: 'dashboard.widget.upcoming',
  games: 'dashboard.widget.games',
  plants: 'dashboard.widget.plants',
  plans: 'dashboard.widget.plans',
}

/** Size names in the resize button label. */
const SIZE_LABEL = {
  mini: 'dashboard.size.mini',
  small: 'dashboard.size.small',
  large: 'dashboard.size.large',
} as const

export { KIND, QUICK_ACTIONS, AGENDA_WIDGETS, WIDGET_LABEL, SIZE_LABEL }
