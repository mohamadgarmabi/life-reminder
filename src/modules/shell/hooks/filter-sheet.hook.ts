import { useState } from 'react'
import { toLocalDigits } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'

const useFilterSheet = (activeCount: number) => {
  const [open, setOpen] = useState(false)
  return {
    open,
    setOpen,
    isActive: activeCount > 0,
    triggerLabel:
      activeCount > 0 ? t('shell.filter.active', { n: toLocalDigits(activeCount) }) : t('shell.filter.label'),
  }
}

export { useFilterSheet }
