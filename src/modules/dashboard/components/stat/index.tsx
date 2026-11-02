import { GlassLayer } from '#/components/glass'
import { useStat } from '#/modules/dashboard/hooks/stat.hook'
import type { StatProps } from '#/modules/dashboard/types'

const Stat = (props: StatProps) => {
  const { valueLabel, valueClassName } = useStat(props)
  return (
    <div className="relative isolate rounded-2xl p-3">
      <GlassLayer radius={16} />
      <p className={valueClassName}>{valueLabel}</p>
      <p className="text-xs text-muted-foreground">{props.label}</p>
    </div>
  )
}

export { Stat }
