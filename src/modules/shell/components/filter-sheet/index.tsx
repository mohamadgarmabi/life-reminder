import type { ReactNode } from 'react'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { Button } from '#/components/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '#/components/drawer'
import { useFilterSheet } from '#/modules/shell/hooks/filter-sheet.hook'
import { t } from '#/modules/shell/utils/i18n'

/** Filter button with an "active" dot; the controls (nested Selects) open in a bottom sheet. */
const FilterSheet = ({
  activeCount,
  onReset,
  children,
}: {
  activeCount: number
  onReset: () => void
  children: ReactNode
}) => {
  const { open, setOpen, isActive, triggerLabel } = useFilterSheet(activeCount)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="relative shrink-0" aria-label={triggerLabel}>
          <SlidersHorizontal /> {t('shell.filter.label')}
          {isActive && <span aria-hidden className="absolute -top-0.5 -end-0.5 size-2.5 rounded-full bg-primary" />}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('shell.filter.title')}</DrawerTitle>
          <DrawerDescription className="sr-only">{t('shell.filter.description')}</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-24">
          <div className="grid gap-2 *:w-full">{children}</div>
        </div>
        <DrawerFooter className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onReset} disabled={!isActive}>
            <RotateCcw /> {t('shell.filter.reset')}
          </Button>
          <Button onClick={() => setOpen(false)}>{t('shell.filter.apply')}</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export { FilterSheet }
