import { cn } from '#/modules/shell/utils/cn'
import { Switch as SwitchPrimitive } from 'radix-ui'
import { switchVariants, switchThumbVariants } from './switch.styles'
import type { SwitchProps } from './switch.types'

const Switch = ({ className, size = 'default', ...props }: SwitchProps) => {
  return (
    <SwitchPrimitive.Root data-slot="switch" data-size={size} className={cn(switchVariants(), className)} {...props}>
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={cn(switchThumbVariants())} />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
