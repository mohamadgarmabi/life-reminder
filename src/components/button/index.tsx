import { cn } from '#/modules/shell/utils/cn'
import { Slot } from 'radix-ui'
import { buttonVariants } from './button.styles'
import type { ButtonProps } from './button.types'
import { GlassLayer } from '#/components/liquid-glass/glass-layer'

const Button = ({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  glass = false,
  glassMaterial = 'clear',
  glassTint,
  children,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot.Root : 'button'
  // Outline/secondary buttons use a flat card surface.
  const pill = !asChild && (variant === 'outline' || variant === 'secondary')

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        buttonVariants({ variant, size, className }),
        pill && 'bg-card bg-clip-padding shadow-none',
        glass && 'font-semibold',
      )}
      data-glass-host={glass ? '' : undefined}
      {...props}
    >
      {glass && <GlassLayer material={glassMaterial} tint={glassTint} />}
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
