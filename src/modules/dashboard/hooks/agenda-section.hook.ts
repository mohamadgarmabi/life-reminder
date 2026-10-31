import type { AgendaSectionProps } from '#/modules/dashboard/types'
import { KIND } from '#/modules/dashboard/utils/dashboard.constants'
import { formatMoney, formatTime, relativeDay } from '#/modules/shell/utils/format'
import { cn } from '#/modules/shell/utils/cn'

const useAgendaSection = ({ items, now, danger }: AgendaSectionProps) => {
  const metaClassName = cn('shrink-0 text-xs', danger ? 'text-destructive' : 'text-muted-foreground')
  return {
    cardClassName: cn('gap-2', danger && 'border-destructive/40'),
    titleClassName: cn('text-base', danger && 'text-destructive'),
    isEmpty: items.length === 0,
    rows: items.map((item) => {
      const { icon, to, label } = KIND[item.kind]
      return {
        key: item.key,
        title: item.title,
        Icon: icon,
        to,
        subtitle: item.installment
          ? `${label} · ${formatMoney(item.installment.amount, item.installment.currency)}`
          : label,
        when: item.at ? `${relativeDay(item.day, now)} · ${formatTime(item.at)}` : relativeDay(item.day, now),
        metaClassName,
      }
    }),
  }
}

export { useAgendaSection }
