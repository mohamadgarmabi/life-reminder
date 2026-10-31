import { Bell, Flower2, Wallet } from 'lucide-react'
import type { AgendaKindMeta, AgendaItem, QuickActionProps } from '#/modules/dashboard/types'

const KIND: Record<AgendaItem['kind'], AgendaKindMeta> = {
  installment: { icon: Wallet, to: '/installments', label: 'قسط' },
  plant: { icon: Flower2, to: '/plants', label: 'آبیاری' },
  reminder: { icon: Bell, to: '/reminders', label: 'یادآور' },
}

const QUICK_ACTIONS: QuickActionProps[] = [
  { to: '/installments', icon: Wallet, label: 'قسط' },
  { to: '/plants', icon: Flower2, label: 'گیاه' },
  { to: '/reminders', icon: Bell, label: 'یادآور' },
]

export { KIND, QUICK_ACTIONS }
