import { cn } from '#/modules/shell/utils/cn'
import { Label as LabelPrimitive } from 'radix-ui'
import { labelVariants } from './label.styles'
import type { LabelProps } from './label.types'

const Label = ({ className, ...props }: LabelProps) => {
  return <LabelPrimitive.Root data-slot="label" className={cn(labelVariants(), className)} {...props} />
}

export { Label }
