import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Play, Plus, Settings } from 'lucide-react'
import { Button } from '#/components/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/alert-dialog'
import { useEngine, useGame } from '#/modules/games/adventure/stores/session.store'
import { startGame } from '#/modules/games/adventure/stores/engine.actions'
import { SettingsPanel } from '#/modules/games/adventure/components/menus/settings'
import { Panel } from '#/modules/games/adventure/components/menus/panel'

const MainMenu = () => {
  const engine = useEngine()
  const save = useGame((g) => g.loadedSave)
  const status = useGame((g) => g.saveStatus)
  const [confirm, setConfirm] = useState(false)
  const [settings, setSettings] = useState(false)

  if (settings) return <SettingsPanel onClose={() => setSettings(false)} />

  const newGame = () => (save ? setConfirm(true) : startGame(engine))

  return (
    <Panel title={engine.world.title}>
      <p className="text-sm text-muted-foreground">{engine.world.description}</p>
      {status === 'corrupt' && (
        <p className="rounded-2xl bg-amber-500/15 p-3 text-sm" role="alert">
          ذخیرهٔ قبلی خوانده نشد؛ نسخه‌ای از آن نگه داشته شد. می‌توانی بازی را از نو شروع کنی.
        </p>
      )}
      {save && (
        <Button size="lg" className="h-12 text-base" autoFocus onClick={() => startGame(engine, save)}>
          <Play /> ادامه
        </Button>
      )}
      <Button size="lg" variant={save ? 'secondary' : 'default'} className="h-12 text-base" onClick={newGame}>
        <Plus /> بازی جدید
      </Button>
      <Button size="lg" variant="secondary" className="h-12" onClick={() => setSettings(true)}>
        <Settings /> تنظیمات
      </Button>
      <Button size="lg" variant="ghost" className="h-12" asChild>
        <Link to="/games">
          <ChevronRight /> بازگشت به بازی‌ها
        </Link>
      </Button>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>بازی جدید؟</AlertDialogTitle>
            <AlertDialogDescription>
              پیشرفت ذخیره‌شدهٔ فعلی پاک می‌شود و بازی از ساحل شروع می‌شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => startGame(engine)}>
              شروع از نو
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  )
}

export { MainMenu }
