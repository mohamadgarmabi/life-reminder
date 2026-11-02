import { cn } from '#/modules/shell/utils/cn'
import { Slot } from 'radix-ui'
import { GlassLayer } from '#/components/glass'
import { buttonVariants } from './button.styles'
import type { ButtonProps } from './button.types'

/** Half of each size's height: buttons are pills, and the glass layer needs the radius in px. */
const PILL_RADIUS = { default: 18, xs: 12, sm: 16, lg: 20, icon: 18, 'icon-xs': 12, 'icon-sm': 16, 'icon-lg': 20 }

const Button = ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot.Root : 'button'
  // Outline/secondary buttons are glass. asChild keeps the solid look: Slot needs a single child.
  const glassy = !asChild && (variant === 'outline' || variant === 'secondary')

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }), glassy && 'isolate bg-transparent shadow-none')}
      {...props}
    >
      {glassy ? (
        <>
          <GlassLayer radius={PILL_RADIUS[size ?? 'default']} />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
