import { cn } from '#/modules/shell/utils/cn'
import { skeletonVariants } from './skeleton.styles'
import type { SkeletonProps } from './skeleton.types'

const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return <div data-slot="skeleton" className={cn(skeletonVariants(), className)} {...props} />
}

export { Skeleton }
