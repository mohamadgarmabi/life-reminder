import { cva } from 'class-variance-authority'

const progressVariants = cva('relative h-2 w-full overflow-hidden rounded-full bg-primary/20')

const progressIndicatorVariants = cva('h-full w-full flex-1 bg-primary transition-all')

export { progressVariants, progressIndicatorVariants }
