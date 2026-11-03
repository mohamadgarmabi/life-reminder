import type { AgendaWidgetProps } from '#/modules/dashboard/types'
import { KIND } from '#/modules/dashboard/utils/dashboard.constants'
import { formatMoney, formatTime, relativeDay, toFaDigits } from '#/modules/shell/utils/format'
import { cn } from '#/modules/shell/utils/cn'

/** Rows that fit a large widget; the rest is summarised as «+N». */
const MAX_ROWS = 3

const useAgendaWidget = ({ items, now, danger, size }: AgendaWidgetProps) => {
  const rowCount = size === 'large' ? MAX_ROWS : 1
  const hidden = items.length - rowCount
  return {
    countLabel: toFaDigits(items.length),
    accentClassName: danger && items.length > 0 ? 'text-destructive' : 'text-foreground',
    isEmpty: items.length === 0,
    moreLabel: size === 'large' && hidden > 0 ? `و ${toFaDigits(hidden)} مورد دیگر` : null,
    rows: items.slice(0, rowCount).map((item) => {
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
        metaClassName: cn('shrink-0 text-xs', danger ? 'text-destructive' : 'text-muted-foreground'),
      }
    }),
  }
}

export { useAgendaWidget }
