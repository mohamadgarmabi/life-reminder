import type { ReactElement, ReactNode } from 'react'
import { Button } from '#/components/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '#/components/drawer'
import { Separator } from '#/components/separator'
import { cn } from '#/modules/shell/utils/cn'
import { useActionSheet } from '#/modules/shell/hooks/action-sheet.hook'

type ActionSheetItem = { key?: string; label: string; icon: ReactNode; onSelect: () => void; destructive?: boolean }
type ActionSheetGroup = { label?: string; items: ActionSheetItem[] }

/** Bottom sheet listing a card's actions; replaces popup menus app-wide. */
const ActionSheet = ({
  trigger,
  title,
  groups,
}: {
  trigger: ReactElement
  title: string
  groups: ActionSheetGroup[]
}) => {
  const { open, setOpen, handleSelect, handleAnimationEnd } = useActionSheet()

  return (
    <Drawer open={open} onOpenChange={setOpen} onAnimationEnd={handleAnimationEnd}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="truncate">{title}</DrawerTitle>
          <DrawerDescription className="sr-only">گزینه‌ها</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {groups.map((g, i) => (
            <div key={g.label ?? i}>
              {i > 0 && <Separator className="my-1" />}
              {g.label && <p className="px-3 pt-2 pb-1 text-xs text-muted-foreground">{g.label}</p>}
              {g.items.map((item) => (
                <Button
                  key={item.key ?? item.label}
                  variant="ghost"
                  className={cn(
                    'h-12 w-full justify-start gap-3 text-base font-normal',
                    item.destructive && 'text-destructive hover:text-destructive',
                  )}
                  onClick={() => handleSelect(item.onSelect)}
                >
                  {item.icon} {item.label}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { ActionSheet }
export type { ActionSheetGroup }
