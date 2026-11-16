import { cn } from '#/modules/shell/utils/cn'
import { Slot } from 'radix-ui'
import { buttonVariants } from './button.styles'
import type { ButtonProps } from './button.types'

const Button = ({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  children,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot.Root : 'button'
  // Outline/secondary buttons are plain card pills; asChild ones keep their variant look.
  const pill = !asChild && (variant === 'outline' || variant === 'secondary')

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }), pill && 'bg-card bg-clip-padding shadow-none')}
      {...props}
    >
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
