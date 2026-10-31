import { cn } from '#/modules/shell/utils/cn'
import { textareaVariants } from './textarea.styles'
import type { TextareaProps } from './textarea.types'

const Textarea = ({ className, ...props }: TextareaProps) => {
  return <textarea data-slot="textarea" className={cn(textareaVariants(), className)} {...props} />
}

export { Textarea }
