'use client'

import { cn } from '#/modules/shell/utils/cn'
import { Separator as SeparatorPrimitive } from 'radix-ui'
import { separatorVariants } from './separator.styles'
import type { SeparatorProps } from './separator.types'

const Separator = ({ className, orientation = 'horizontal', decorative = true, ...props }: SeparatorProps) => {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(separatorVariants(), className)}
      {...props}
    />
  )
}

export { Separator }
