import { Switch as SwitchPrimitive } from '#/components/liquid-glass/controls/Switch.tsx'
import type { SwitchProps } from './switch.types'

const Switch = ({ className, size = 'default', checked, defaultChecked, onCheckedChange, ...props }: SwitchProps) => {
  return (
    <span className={className}>
      <SwitchPrimitive
        {...props}
        checked={checked ?? defaultChecked ?? false}
        onChange={onCheckedChange}
        size={size === 'sm' ? 'sm' : 'md'}
        label=""
      />
    </span>
  )
}

export { Switch }
