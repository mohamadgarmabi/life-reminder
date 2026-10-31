import { cn } from '#/modules/shell/utils/cn'
import {
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardDescriptionVariants,
  cardActionVariants,
  cardContentVariants,
  cardFooterVariants,
} from './card.styles'
import type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardActionProps,
  CardContentProps,
  CardFooterProps,
} from './card.types'

const Card = ({ className, ...props }: CardProps) => {
  return <div data-slot="card" className={cn(cardVariants(), className)} {...props} />
}

const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return <div data-slot="card-header" className={cn(cardHeaderVariants(), className)} {...props} />
}

const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return <div data-slot="card-title" className={cn(cardTitleVariants(), className)} {...props} />
}

const CardDescription = ({ className, ...props }: CardDescriptionProps) => {
  return <div data-slot="card-description" className={cn(cardDescriptionVariants(), className)} {...props} />
}

const CardAction = ({ className, ...props }: CardActionProps) => {
  return <div data-slot="card-action" className={cn(cardActionVariants(), className)} {...props} />
}

const CardContent = ({ className, ...props }: CardContentProps) => {
  return <div data-slot="card-content" className={cn(cardContentVariants(), className)} {...props} />
}

const CardFooter = ({ className, ...props }: CardFooterProps) => {
  return <div data-slot="card-footer" className={cn(cardFooterVariants(), className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter }
