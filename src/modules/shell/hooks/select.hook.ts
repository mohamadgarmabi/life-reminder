import { useState } from 'react'
import type { SelectOption } from '#/modules/shell/types'

const useSelect = ({
  value,
  onValueChange,
  options,
}: {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption<string>[]
}) => {
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
