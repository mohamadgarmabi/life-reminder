import { Sparkles } from 'lucide-react'
import { Button } from '#/components/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '#/components/drawer'
import { useUpdatePrompt } from '#/modules/shell/hooks/update-prompt.hook'
import { t } from '#/modules/shell/utils/i18n'

const UpdatePrompt = () => {
  const { open, versionLabel, notes, hasNotes, applying, handleOpenChange, handleApply } = useUpdatePrompt()

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="items-center pt-4 text-center">
          <div className="mb-1 rounded-full bg-secondary p-3">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <DrawerTitle>{t('shell.update.title')}</DrawerTitle>
          <DrawerDescription>{versionLabel}</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-28">
          <h3 className="mb-2 text-sm font-semibold">{t('shell.update.changes')}</h3>
          {hasNotes && (
            <ul className="mb-2 space-y-1.5 rounded-2xl surface p-4 text-sm" dir="auto">
              {notes.map((note) => (
                <li key={note.title} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/40" />
                  <div className="min-w-0">
                    <p className="font-medium">{note.title}</p>
                    {note.body && <p className="mt-1 whitespace-pre-line text-muted-foreground">{note.body}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!hasNotes && (
            <p className="mb-2 rounded-2xl surface p-4 text-sm text-muted-foreground">{t('shell.update.noNotes')}</p>
          )}
        </div>
        <DrawerFooter className="grid gap-2">
          <Button size="lg" onClick={handleApply} disabled={applying}>
            {t('shell.update.apply')}
          </Button>
          <Button size="lg" variant="ghost" onClick={() => handleOpenChange(false)}>
            {t('common.later')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export { UpdatePrompt }
