import { cn } from '#/modules/shell/utils/cn'
import { inputVariants } from './input.styles'
import type { InputProps } from './input.types'

const Input = ({ className, type, ...props }: InputProps) => {
  return <input type={type} data-slot="input" className={cn(inputVariants(), className)} {...props} />
}

export { Input }
