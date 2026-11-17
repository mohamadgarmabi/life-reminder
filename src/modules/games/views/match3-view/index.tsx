import { LayoutGrid, RotateCcw } from 'lucide-react'
import { GameShell } from '#/modules/games/components/game-shell'
import { LevelPicker } from '#/modules/games/components/level-picker'
import { Match3Board } from '#/modules/games/components/match3-board'
import { useMatch3 } from '#/modules/games/hooks/match3.hook'
import { Button } from '#/components/button'
import { Progress } from '#/components/progress'
import { t } from '#/modules/shell/utils/i18n'

const Match3View = () => {
  const {
    level,
    levels,
    grid,
    clearing,
    spawned,
    selected,
    busy,
    status,
    canGoNext,
    levelLabel,
    scoreLabel,
    targetLabel,
    movesLabel,
    comboLabel,
    bestLabel,
    progressValue,
    handleStart,
    handleRetry,
    handleNext,
    handleLevels,
    handleTap,
    handleSwap,
  } = useMatch3()

  if (level === null) {
    return (
      <GameShell title={t('games.match3.title')}>
        <div className="w-full max-w-2xl space-y-3">
          <p className="text-center text-sm text-muted-foreground">{t('games.match3.intro')}</p>
          <LevelPicker levels={levels} onPick={handleStart} />
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell
      title={t('games.match3.title')}
      actions={
        <Button
          variant="secondary"
          size="icon"
          className="size-11 bg-secondary/80 [&_svg:not([class*=size-])]:size-5"
          disabled={busy}
          onClick={handleLevels}
          aria-label={t('games.match3.levels')}
        >
          <LayoutGrid />
        </Button>
      }
    >
      <div className="flex w-full max-w-3xl flex-col items-center gap-4 landscape:flex-row landscape:items-start">
        <div className="w-[min(100%,calc(100cqh-14rem))] min-w-56 shrink-0 landscape:w-[min(55%,100cqh)] landscape:min-w-44">
          <Match3Board
            grid={grid}
            clearing={clearing}
            spawned={spawned}
            selected={selected}
            busy={busy}
            onTap={handleTap}
            onSwap={handleSwap}
          />
        </div>

        <div className="w-full min-w-0 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">{levelLabel}</span>
            {bestLabel && (
              <span className="text-muted-foreground">{t('games.match3.bestScore', { score: bestLabel })}</span>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-2xl surface p-2">
              <dt className="text-xs text-muted-foreground">{t('games.score')}</dt>
              <dd className="text-lg font-bold">
                {scoreLabel}
                {comboLabel && <span className="ms-1 text-sm text-primary">{comboLabel}</span>}
              </dd>
            </div>
            <div className="rounded-2xl surface p-2">
              <dt className="text-xs text-muted-foreground">{t('games.match3.movesLeft')}</dt>
              <dd className="text-lg font-bold">{movesLabel}</dd>
            </div>
          </dl>
          <div className="space-y-1">
            <Progress value={progressValue} aria-label={t('games.match3.progress')} />
            <p className="text-xs text-muted-foreground">{t('games.match3.target', { target: targetLabel })}</p>
          </div>

          {status === 'won' && (
            <div className="flex flex-col items-center gap-3 rounded-2xl surface p-4 text-center" role="status">
              <p className="font-semibold">{t('games.match3.won')}</p>
              {canGoNext && <Button onClick={handleNext}>{t('games.nextLevel')}</Button>}
            </div>
          )}
          {status === 'lost' && (
            <div className="flex flex-col items-center gap-3 rounded-2xl surface p-4 text-center" role="status">
              <p className="font-semibold">{t('games.match3.outOfMoves')}</p>
              <Button onClick={handleRetry}>
                <RotateCcw /> {t('games.tryAgain')}
              </Button>
            </div>
          )}
          {status === 'playing' && (
            <Button variant="outline" className="w-full" disabled={busy} onClick={handleRetry}>
              <RotateCcw /> {t('games.startOver')}
            </Button>
          )}
        </div>
      </div>
    </GameShell>
  )
}

export default Match3View
