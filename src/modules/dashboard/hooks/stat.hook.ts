import type { StatProps } from '#/modules/dashboard/types'
import { toFaDigits } from '#/modules/shell/utils/format'
import { cn } from '#/modules/shell/utils/cn'

const useStat = ({ value, tone }: StatProps) => ({
  valueLabel: toFaDigits(value),
  valueClassName: cn('text-xl font-semibold tabular-nums', tone === 'danger' && 'text-destructive'),
})

export { useStat }
