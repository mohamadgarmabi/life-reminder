import { AlertTriangle, Bell, CalendarDays, CalendarCheck, Flower2, Target, Wallet } from 'lucide-react'
import type {
  Agenda,
  AgendaKindMeta,
  AgendaItem,
  AgendaWidgetProps,
  QuickActionProps,
  WidgetId,
} from '#/modules/dashboard/types'

const KIND: Record<AgendaItem['kind'], AgendaKindMeta> = {
  installment: { icon: Wallet, to: '/installments', label: 'قسط' },
  plant: { icon: Flower2, to: '/plants', label: 'آبیاری' },
  reminder: { icon: Bell, to: '/reminders', label: 'یادآور' },
}

const QUICK_ACTIONS: QuickActionProps[] = [
  { to: '/installments', icon: Wallet, label: 'قسط' },
  { to: '/plants', icon: Flower2, label: 'گیاه' },
  { to: '/reminders', icon: Bell, label: 'یادآور' },
  { to: '/plans', icon: Target, label: 'برنامه' },
]

const AGENDA_WIDGETS: Record<keyof Agenda, Pick<AgendaWidgetProps, 'title' | 'icon' | 'empty' | 'danger'>> = {
  overdue: { title: 'معوق', icon: AlertTriangle, empty: 'چیزی عقب نمانده.', danger: true },
  today: { title: 'امروز', icon: CalendarCheck, empty: 'برای امروز کاری ثبت نشده. روز آرامی داشته باشید!' },
  upcoming: { title: 'روزهای آینده', icon: CalendarDays, empty: 'در هفتهٔ پیش رو موردی نیست.' },
}

/** Names used in edit-mode button labels. */
const WIDGET_LABEL: Record<WidgetId, string> = {
  dollar: 'ویجت قیمت دلار',
  gold: 'ویجت قیمت طلا',
  date: 'ویجت تاریخ',
  quick: 'ویجت افزودن سریع',
  overdue: 'ویجت معوق',
  today: 'ویجت امروز',
  upcoming: 'ویجت روزهای آینده',
  games: 'ویجت بازی‌ها',
  plants: 'ویجت گیاهان',
  plans: 'ویجت پیشرفت برنامه‌ها',
}

export { KIND, QUICK_ACTIONS, AGENDA_WIDGETS, WIDGET_LABEL }
