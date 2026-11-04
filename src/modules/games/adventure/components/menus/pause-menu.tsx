import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Backpack, Lightbulb, LogOut, Play, Settings, Undo2 } from 'lucide-react'
import { Button } from '#/components/button'
import { useEngine, useGame } from '#/modules/games/adventure/stores/session.store'
import { resume, saveNow, toCheckpoint } from '#/modules/games/adventure/stores/engine.actions'
import { SettingsPanel } from '#/modules/games/adventure/components/menus/settings'
import { InventoryDrawer } from '#/modules/games/adventure/components/menus/inventory'
import { Panel } from '#/modules/games/adventure/components/menus/panel'

const PauseMenu = () => {
  const engine = useEngine()
  const navigate = useNavigate()
  const area = useGame((g) => g.area)
  const [view, setView] = useState<'menu' | 'hint' | 'settings'>('menu')
  const [inventory, setInventory] = useState(false)
  const hint = engine.world.hints[area] ?? engine.world.hints.start

  if (view === 'settings') return <SettingsPanel onClose={() => setView('menu')} />

  const quit = async () => {
    await saveNow(engine)
    void navigate({ to: '/games' })
  }

  return (
    <Panel title={view === 'hint' ? 'راهنما' : 'مکث'}>
      {view === 'hint' ? (
        <>
          <p className="text-start leading-7">{hint}</p>
          <Button size="lg" className="h-12" onClick={() => setView('menu')}>
            بازگشت
          </Button>
        </>
      ) : (
        <>
          <Button size="lg" className="h-12 text-base" autoFocus onClick={() => resume(engine)}>
            <Play /> ادامه
          </Button>
          <Button size="lg" variant="secondary" className="h-12" onClick={() => setView('hint')}>
            <Lightbulb /> راهنما
          </Button>
          <Button size="lg" variant="secondary" className="h-12" onClick={() => setInventory(true)}>
            <Backpack /> کوله‌پشتی
          </Button>
          <Button size="lg" variant="secondary" className="h-12" onClick={() => setView('settings')}>
            <Settings /> تنظیمات
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-12"
            onClick={() => {
              toCheckpoint(engine)
              resume(engine)
            }}
          >
            <Undo2 /> گیر کرده‌ام
          </Button>
          <Button size="lg" variant="ghost" className="h-12" onClick={() => void quit()}>
            <LogOut /> ذخیره و خروج
          </Button>
        </>
      )}
      <InventoryDrawer open={inventory} onOpenChange={setInventory} />
    </Panel>
  )
}

export { PauseMenu }
