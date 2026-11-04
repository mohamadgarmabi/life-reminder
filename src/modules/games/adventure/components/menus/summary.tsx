import { Link } from '@tanstack/react-router'
import { Button } from '#/components/button'
import { useEngine, useGame, patchGame } from '#/modules/games/adventure/stores/session.store'
import { summary } from '#/modules/games/adventure/utils/session'
import { toFaDigits } from '#/modules/shell/utils/format'
import { Panel } from '#/modules/games/adventure/components/menus/panel'

const formatTime = (ms: number) => {
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return toFaDigits(`${min}:${String(sec).padStart(2, '0')}`)
}

const Summary = () => {
  const { world, store } = useEngine()
  const session = useGame((g) => g.session)
  const s = summary(session, world)
  const stats = [
    { label: 'زمان بازی', value: formatTime(s.playTimeMs) },
    { label: 'برگ‌های دفترچه', value: `${toFaDigits(s.journals[0])} از ${toFaDigits(s.journals[1])}` },
    { label: 'رازها', value: `${toFaDigits(s.secrets[0])} از ${toFaDigits(s.secrets[1])}` },
  ]
  return (
    <Panel title="فانوس دوباره روشن شد">
      <p className="text-sm text-muted-foreground">
        نور فانوس دوباره بر دریا می‌تابد و کشتی‌ها راه خانه را پیدا می‌کنند.
      </p>
      <dl className="flex gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-w-0 flex-1 flex-col items-center rounded-2xl bg-secondary/70 px-2 py-2"
          >
            <dt className="text-[11px] text-muted-foreground">{stat.label}</dt>
            <dd className="text-lg leading-tight font-bold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <Button size="lg" className="h-12 text-base" autoFocus onClick={() => patchGame(store, { phase: 'playing' })}>
        ادامهٔ گشت‌وگذار
      </Button>
      <Button size="lg" variant="ghost" className="h-12" asChild>
        <Link to="/games">بازگشت به بازی‌ها</Link>
      </Button>
    </Panel>
  )
}

export { Summary }
