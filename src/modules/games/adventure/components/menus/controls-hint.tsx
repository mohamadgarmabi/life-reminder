import { Hand, Move, RotateCw } from 'lucide-react'
import { Button } from '#/components/button'
import { useEngine, useGame } from '#/modules/games/adventure/stores/session.store'
import { updateSettings } from '#/modules/games/adventure/stores/engine.actions'
import { Panel } from '#/modules/games/adventure/components/menus/panel'

/** First-run controls guide; shown again after "show controls guide" in settings. */
const ControlsHint = () => {
  const engine = useEngine()
  const leftHanded = useGame((g) => g.settings.leftHanded)
  const [moveSide, lookSide] = leftHanded ? ['راست', 'چپ'] : ['چپ', 'راست']
  const rows = [
    { icon: Move, text: `انگشتت را روی نیمهٔ ${moveSide} صفحه بگذار و بکش تا راه بروی.` },
    { icon: RotateCw, text: `روی نیمهٔ ${lookSide} صفحه بکش تا به اطراف نگاه کنی.` },
    { icon: Hand, text: 'نزدیک چیزهایی که می‌درخشند، دکمهٔ کار ظاهر می‌شود؛ آن را بزن.' },
  ]
  return (
    <Panel title="راهنمای کنترل‌ها">
      <ul className="flex flex-col gap-3 text-start">
        {rows.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <Icon className="size-6 shrink-0 text-primary" aria-hidden />
            <span className="text-sm leading-6">{text}</span>
          </li>
        ))}
      </ul>
      <Button size="lg" className="h-12 text-base" autoFocus onClick={() => updateSettings(engine, { hintSeen: true })}>
        فهمیدم
      </Button>
    </Panel>
  )
}

export { ControlsHint }
