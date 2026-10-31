import { cva } from 'class-variance-authority'

const separatorVariants = cva([
  'shrink-0 bg-border',
  'data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
  'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
])

export { separatorVariants }
