import { Sparkles } from 'lucide-react'
import { Button } from '#/components/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '#/components/drawer'
import { useUpdatePrompt } from '#/modules/shell/hooks/update-prompt.hook'

const UpdatePrompt = () => {
  const { open, versionLabel, notes, hasNotes, applying, handleOpenChange, handleApply } = useUpdatePrompt()

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="items-center pt-4 text-center">
          <div className="mb-1 rounded-full bg-secondary p-3">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <DrawerTitle>به‌روزرسانی آماده است</DrawerTitle>
          <DrawerDescription>{versionLabel}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <h3 className="mb-2 text-sm font-semibold">تغییرات این نسخه</h3>
          {hasNotes && (
            <ul className="mb-2 space-y-1.5 rounded-2xl glass p-4 text-sm" dir="auto">
              {notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/40" />
                  {note}
                </li>
              ))}
            </ul>
          )}
          {!hasNotes && (
            <p className="mb-2 rounded-2xl glass p-4 text-sm text-muted-foreground">بهبودها و رفع اشکال‌ها.</p>
          )}
        </div>
        <div className="grid gap-2 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Button size="lg" onClick={handleApply} disabled={applying}>
            اعمال به‌روزرسانی
          </Button>
          <Button size="lg" variant="ghost" onClick={() => handleOpenChange(false)}>
            بعداً
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { UpdatePrompt }
