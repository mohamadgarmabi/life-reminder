import type { SelectOption } from '#/modules/shell/types'

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption<string>[]
  /** Sheet title and the trigger's accessible name. */
  label: string
  id?: string
  disabled?: boolean
  className?: string
  /** Set when rendered inside another drawer (form sheets). */
  nested?: boolean
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

type UseSelectParams = Pick<SelectProps, 'value' | 'onValueChange' | 'options'>

export type { SelectProps, UseSelectParams }
