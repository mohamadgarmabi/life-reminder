import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Backpack, Lightbulb, LogOut, Play, Settings, Undo2 } from 'lucide-react'
import { Button } from '#/components/button'
import { useEngine, useGame } from '#/modules/games/adventure/stores/session.store'
import { resume, saveNow, toCheckpoint } from '#/modules/games/adventure/stores/engine.actions'
import { SettingsPanel } from '#/modules/games/adventure/components/menus/settings'
import { InventoryDrawer } from '#/modules/games/adventure/components/menus/inventory'
import { Panel } from '#/modules/games/adventure/components/menus/panel'
import { t } from '#/modules/shell/utils/i18n'

const PauseMenu = () => {
  const engine = useEngine()
  const navigate = useNavigate()
  const area = useGame((g) => g.area)
  const [view, setView] = useState<'menu' | 'hint' | 'settings'>('menu')
  const [inventory, setInventory] = useState(false)
  const hint = t(engine.world.hints[area] ?? engine.world.hints.start)

  if (view === 'settings') return <SettingsPanel onClose={() => setView('menu')} />

  const quit = async () => {
    await saveNow(engine)
    void navigate({ to: '/games' })
  }

  return (
    <Panel title={t(view === 'hint' ? 'adventure.pauseMenu.hint' : 'adventure.pause')}>
      {view === 'hint' ? (
        <>
          <p className="text-start leading-7">{hint}</p>
          <Button size="lg" className="h-12" onClick={() => setView('menu')}>
            {t('adventure.back')}
          </Button>
        </>
      ) : (
        <>
          <Button size="lg" className="h-12 text-base" autoFocus onClick={() => resume(engine)}>
            <Play /> {t('adventure.continue')}
          </Button>
          <Button size="lg" variant="secondary" className="h-12" onClick={() => setView('hint')}>
            <Lightbulb /> {t('adventure.pauseMenu.hint')}
          </Button>
          <Button size="lg" variant="secondary" className="h-12" onClick={() => setInventory(true)}>
            <Backpack /> {t('adventure.backpack')}
          </Button>
          <Button size="lg" variant="secondary" className="h-12" onClick={() => setView('settings')}>
            <Settings /> {t('adventure.settings')}
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
            <Undo2 /> {t('adventure.pauseMenu.stuck')}
          </Button>
          <Button size="lg" variant="ghost" className="h-12" onClick={() => void quit()}>
            <LogOut /> {t('adventure.pauseMenu.saveQuit')}
          </Button>
        </>
      )}
      <InventoryDrawer open={inventory} onOpenChange={setInventory} />
    </Panel>
  )
}

export { PauseMenu }
