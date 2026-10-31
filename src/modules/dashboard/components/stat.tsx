import { useStat } from '#/modules/dashboard/hooks/stat.hook'
import type { StatProps } from '#/modules/dashboard/types'

const Stat = (props: StatProps) => {
  const { valueLabel, valueClassName } = useStat(props)
  return (
    <div className="glass rounded-2xl p-3">
      <p className={valueClassName}>{valueLabel}</p>
      <p className="text-xs text-muted-foreground">{props.label}</p>
    </div>
  )
}

export { Stat }
