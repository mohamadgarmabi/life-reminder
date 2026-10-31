import { cva } from 'class-variance-authority'

const cardVariants = cva('flex flex-col gap-3 rounded-2xl border border-transparent glass py-4 text-card-foreground')

const cardHeaderVariants = cva([
  '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4',
  'has-data-[slot=card-action]:grid-cols-[1fr_auto]',
  '[.border-b]:pb-6',
])

const cardTitleVariants = cva('leading-none font-semibold')

const cardDescriptionVariants = cva('text-sm text-muted-foreground')

const cardActionVariants = cva('col-start-2 row-span-2 row-start-1 self-start justify-self-end')

const cardContentVariants = cva('px-4')

const cardFooterVariants = cva('flex items-center px-4 [.border-t]:pt-6')

export {
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardDescriptionVariants,
  cardActionVariants,
  cardContentVariants,
  cardFooterVariants,
}
