import { cn } from '#/modules/shell/utils/cn'
import { Progress as ProgressPrimitive } from 'radix-ui'
import { useProgress } from './progress.hook'
import { progressVariants, progressIndicatorVariants } from './progress.styles'
import type { ProgressProps } from './progress.types'

const Progress = ({ className, value, ...props }: ProgressProps) => {
  const { indicatorStyle } = useProgress(value)
  return (
    <ProgressPrimitive.Root data-slot="progress" className={cn(progressVariants(), className)} {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={progressIndicatorVariants()}
        style={indicatorStyle}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
