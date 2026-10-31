import * as React from 'react'
import { cn } from '#/modules/shell/utils/cn'
import { Progress as ProgressPrimitive } from 'radix-ui'
import { useProgress } from '#/modules/shell/hooks/progress.hook'

const Progress = ({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) => {
  const { indicatorStyle } = useProgress(value)
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-all"
        style={indicatorStyle}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
