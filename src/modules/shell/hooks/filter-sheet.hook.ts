import { useState } from 'react'
import { toFaDigits } from '#/modules/shell/utils/format'

const useFilterSheet = (activeCount: number) => {
  const [open, setOpen] = useState(false)
  return {
    open,
    setOpen,
    isActive: activeCount > 0,
    triggerLabel: activeCount > 0 ? `فیلتر (${toFaDigits(activeCount)} فعال)` : 'فیلتر',
  }
}

export { useFilterSheet }
