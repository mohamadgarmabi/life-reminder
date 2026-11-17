import { Hand, Move, RotateCw } from 'lucide-react'
import { Button } from '#/components/button'
import { useEngine, useGame } from '#/modules/games/adventure/stores/session.store'
import { updateSettings } from '#/modules/games/adventure/stores/engine.actions'
import { Panel } from '#/modules/games/adventure/components/menus/panel'
import { t } from '#/modules/shell/utils/i18n'

/** First-run controls guide; shown again after "show controls guide" in settings. */
const ControlsHint = () => {
  const engine = useEngine()
  const leftHanded = useGame((g) => g.settings.leftHanded)
  const [moveSide, lookSide] = leftHanded
    ? [t('adventure.side.right'), t('adventure.side.left')]
    : [t('adventure.side.left'), t('adventure.side.right')]
  const rows = [
    { icon: Move, text: t('adventure.controls.move', { side: moveSide }) },
    { icon: RotateCw, text: t('adventure.controls.look', { side: lookSide }) },
    { icon: Hand, text: t('adventure.controls.act') },
  ]
  return (
    <Panel title={t('adventure.controls.title')}>
      <ul className="flex flex-col gap-3 text-start">
        {rows.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <Icon className="size-6 shrink-0 text-primary" aria-hidden />
            <span className="text-sm leading-6">{text}</span>
          </li>
        ))}
      </ul>
      <Button size="lg" className="h-12 text-base" autoFocus onClick={() => updateSettings(engine, { hintSeen: true })}>
        {t('adventure.controls.gotIt')}
      </Button>
    </Panel>
  )
}

export { ControlsHint }
