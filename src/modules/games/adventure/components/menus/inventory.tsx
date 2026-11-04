import { useState } from 'react'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '#/components/drawer'
import { Button } from '#/components/button'
import { useEngine, useGame, patchGame } from '#/modules/games/adventure/stores/session.store'
import { resume } from '#/modules/games/adventure/stores/engine.actions'

/** Items in the order found; journal pages open in the reader. */
const InventoryDrawer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { world } = useEngine()
  const inventory = useGame((g) => g.session.inventory)
  const [reading, setReading] = useState<string | null>(null)
  const page = reading ? world.items[reading] : null

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => {
        setReading(null)
        onOpenChange(v)
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{page ? page.name : 'کوله‌پشتی'}</DrawerTitle>
          <DrawerDescription>
            {page ? page.description : inventory.length ? 'یادگارها و برگ‌های دفترچه' : 'هنوز چیزی پیدا نکرده‌ای.'}
          </DrawerDescription>
        </DrawerHeader>
        <div
          data-vaul-no-drag
          className="max-h-[60vh] overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        >
          {page ? (
            <div className="flex flex-col gap-4">
              <p className="rounded-2xl bg-amber-100/80 p-4 text-start leading-8 text-amber-950 dark:bg-amber-200/15 dark:text-amber-50">
                {page.text}
              </p>
              <Button variant="secondary" onClick={() => setReading(null)}>
                بازگشت به کوله‌پشتی
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {inventory.map((id) => {
                const item = world.items[id]
                const journal = item.kind === 'journal'
                return (
                  <li key={id}>
                    <button
                      type="button"
                      disabled={!journal}
                      onClick={() => setReading(id)}
                      className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-secondary/70 p-3 text-start disabled:opacity-100"
                    >
                      <span className="text-3xl" aria-hidden>
                        {item.icon}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="font-bold">{item.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {journal ? 'برای خواندن لمس کن' : item.description}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/** Opens right after a journal page is picked up; closing resumes play. */
const JournalReader = () => {
  const engine = useEngine()
  const reading = useGame((g) => g.reading)
  const page = reading ? engine.world.items[reading] : null
  const close = () => {
    patchGame(engine.store, { reading: null })
    resume(engine)
  }
  return (
    <Drawer open={!!page} onOpenChange={(v) => !v && close()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{page?.name}</DrawerTitle>
          <DrawerDescription>{page?.description}</DrawerDescription>
        </DrawerHeader>
        <div
          data-vaul-no-drag
          className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        >
          <p className="rounded-2xl bg-amber-100/80 p-4 text-start leading-8 text-amber-950 dark:bg-amber-200/15 dark:text-amber-50">
            {page?.text}
          </p>
          <Button size="lg" onClick={close}>
            ادامه
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { InventoryDrawer, JournalReader }
