import { cn } from '#/modules/shell/utils/cn'
import { alertVariants, alertTitleVariants, alertDescriptionVariants } from './alert.styles'
import type { AlertProps, AlertTitleProps, AlertDescriptionProps } from './alert.types'

const Alert = ({ className, variant, ...props }: AlertProps) => {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

const AlertTitle = ({ className, ...props }: AlertTitleProps) => {
  return <div data-slot="alert-title" className={cn(alertTitleVariants(), className)} {...props} />
}

const AlertDescription = ({ className, ...props }: AlertDescriptionProps) => {
  return <div data-slot="alert-description" className={cn(alertDescriptionVariants(), className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }
