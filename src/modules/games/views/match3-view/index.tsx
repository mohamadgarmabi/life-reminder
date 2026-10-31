import { LayoutGrid, RotateCcw } from 'lucide-react'
import { BackButton } from '#/modules/games/components/back-button'
import { LevelPicker } from '#/modules/games/components/level-picker'
import { Match3Board } from '#/modules/games/components/match3-board'
import { useMatch3 } from '#/modules/games/hooks/match3.hook'
import { PageHeader } from '#/modules/shell/components/states'
import { Button } from '#/modules/shell/components/ui/button'
import { Progress } from '#/modules/shell/components/ui/progress'

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
      <>
        <PageHeader
          title="سه‌تایی"
          description="سه یا چند نگین هم‌شکل را کنار هم بچین."
          action={<BackButton to="/games" label="بازی‌ها" />}
        />
        <LevelPicker levels={levels} onPick={handleStart} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="سه‌تایی"
        action={
          <Button variant="outline" disabled={busy} onClick={handleLevels}>
            <LayoutGrid /> مراحل
          </Button>
        }
      />
      <div className="flex flex-col items-center gap-4 landscape:flex-row landscape:items-start">
        <div className="w-[min(100%,calc(100dvh-20rem))] min-w-56 shrink-0 landscape:w-[min(55%,calc(100dvh-12rem))] landscape:min-w-44">
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
            {bestLabel && <span className="text-muted-foreground">بهترین: {bestLabel}</span>}
          </div>
          <dl className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-2xl glass p-2">
              <dt className="text-xs text-muted-foreground">امتیاز</dt>
              <dd className="text-lg font-bold">
                {scoreLabel}
                {comboLabel && <span className="ms-1 text-sm text-primary">{comboLabel}</span>}
              </dd>
            </div>
            <div className="rounded-2xl glass p-2">
              <dt className="text-xs text-muted-foreground">حرکت باقی‌مانده</dt>
              <dd className="text-lg font-bold">{movesLabel}</dd>
            </div>
          </dl>
          <div className="space-y-1">
            <Progress value={progressValue} aria-label="پیشرفت تا هدف" />
            <p className="text-xs text-muted-foreground">هدف: {targetLabel}</p>
          </div>

          {status === 'won' && (
            <div className="flex flex-col items-center gap-3 rounded-2xl glass p-4 text-center" role="status">
              <p className="font-semibold">آفرین! به هدف رسیدی.</p>
              {canGoNext && <Button onClick={handleNext}>مرحله بعد</Button>}
            </div>
          )}
          {status === 'lost' && (
            <div className="flex flex-col items-center gap-3 rounded-2xl glass p-4 text-center" role="status">
              <p className="font-semibold">حرکت‌ها تمام شد.</p>
              <Button onClick={handleRetry}>
                <RotateCcw /> دوباره
              </Button>
            </div>
          )}
          {status === 'playing' && (
            <Button variant="outline" className="w-full" disabled={busy} onClick={handleRetry}>
              <RotateCcw /> شروع دوباره
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default Match3View
