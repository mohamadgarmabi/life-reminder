import { useState } from 'react'
import type { UseSelectParams } from './select.types'

const useSelect = ({ value, onValueChange, options }: UseSelectParams) => {
  const [open, setOpen] = useState(false)
  return {
    open,
    setOpen,
    currentLabel: options.find((o) => o.value === value)?.label ?? '',
    items: options.map((o) => ({
      ...o,
      selected: o.value === value,
      onSelect: () => {
        onValueChange(o.value)
        setOpen(false)
      },
    })),
  }
}

export { useSelect }
