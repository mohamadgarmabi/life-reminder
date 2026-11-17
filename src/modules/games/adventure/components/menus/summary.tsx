import { Link } from '@tanstack/react-router'
import { Button } from '#/components/button'
import { useEngine, useGame, patchGame } from '#/modules/games/adventure/stores/session.store'
import { summary } from '#/modules/games/adventure/utils/session'
import { toLocalDigits } from '#/modules/shell/utils/format'
import { Panel } from '#/modules/games/adventure/components/menus/panel'
import { t } from '#/modules/shell/utils/i18n'

const formatTime = (ms: number) => {
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return toLocalDigits(`${min}:${String(sec).padStart(2, '0')}`)
}

const Summary = () => {
  const { world, store } = useEngine()
  const session = useGame((g) => g.session)
  const s = summary(session, world)
  const stats = [
    { label: t('adventure.summary.playTime'), value: formatTime(s.playTimeMs) },
    {
      label: t('adventure.summary.journals'),
      value: t('adventure.summary.outOf', { done: toLocalDigits(s.journals[0]), total: toLocalDigits(s.journals[1]) }),
    },
    {
      label: t('adventure.summary.secrets'),
      value: t('adventure.summary.outOf', { done: toLocalDigits(s.secrets[0]), total: toLocalDigits(s.secrets[1]) }),
    },
  ]
  return (
    <Panel title={t('adventure.summary.title')}>
      <p className="text-sm text-muted-foreground">{t('adventure.summary.body')}</p>
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
        {t('adventure.summary.explore')}
      </Button>
      <Button size="lg" variant="ghost" className="h-12" asChild>
        <Link to="/games">{t('adventure.backToGames')}</Link>
      </Button>
    </Panel>
  )
}

export { Summary }
