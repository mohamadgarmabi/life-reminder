import { cn } from '#/modules/shell/utils/cn'
import { Slot } from 'radix-ui'
import { badgeVariants } from './badge.styles'
import type { BadgeProps } from './badge.types'

const Badge = ({ className, variant = 'default', asChild = false, ...props }: BadgeProps) => {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
