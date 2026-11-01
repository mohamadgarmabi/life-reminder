import { useEffect, useState } from 'react'
import { Flag, RotateCcw } from 'lucide-react'
import { GameShell } from '#/modules/games/components/game-shell'
import { useScores } from '#/modules/games/hooks/scores.hook'
import { blankField, isCleared, neighbors, plantMines, revealCell, type MineCell } from '#/modules/games/utils/mines'
import { sfx } from '#/modules/games/utils/sfx'
import { cn } from '#/modules/shell/utils/cn'
import { toFaDigits } from '#/modules/shell/utils/format'
import { Button } from '#/components/button'

const LEVELS = {
  easy: { label: 'آسان', rows: 9, cols: 8, mines: 10 },
  medium: { label: 'متوسط', rows: 12, cols: 10, mines: 20 },
  hard: { label: 'سخت', rows: 16, cols: 12, mines: 38 },
}
type Level = keyof typeof LEVELS

const NUMBER_COLORS = [
  '',
  'text-blue-600',
  'text-green-600',
  'text-red-600',
  'text-violet-700',
  'text-amber-700',
  'text-cyan-700',
  'text-foreground',
  'text-muted-foreground',
]

type MinesState = {
  level: Level
  field: MineCell[]
  status: 'idle' | 'playing' | 'won' | 'lost'
  startedAt: number
  endedAt: number
}

const freshGame = (level: Level): MinesState => ({
  level,
  field: blankField(LEVELS[level].rows, LEVELS[level].cols),
  status: 'idle',
  startedAt: 0,
  endedAt: 0,
})

const formatSeconds = (s: number) => `${toFaDigits(s)} ثانیه`

const MinesView = () => {
  const [game, setGame] = useState(() => freshGame('easy'))
  const [flagMode, setFlagMode] = useState(false)
  const [now, setNow] = useState(0)
  const { rows, cols, mines } = LEVELS[game.level]
  const { scores, best, submit } = useScores(`mines-${game.level}`, true)

  useEffect(() => {
    if (game.status !== 'playing') return
    const id = setInterval(() => setNow(performance.now()), 500)
    return () => clearInterval(id)
  }, [game.status])

  const elapsed =
    game.status === 'idle'
      ? 0
      : Math.floor(((game.status === 'playing' ? Math.max(now, game.startedAt) : game.endedAt) - game.startedAt) / 1000)
  const flags = game.field.filter((c) => c.flag).length

  const open = (field: MineCell[], indexes: number[], startedAt: number, at: number) => {
    let next = field
    for (const i of indexes) next = revealCell(next, rows, cols, i)
    if (indexes.some((i) => next[i].mine && !next[i].flag)) {
      sfx.lose()
      setGame({
        ...game,
        startedAt,
        field: next.map((c) => (c.mine ? { ...c, open: true } : c)),
        status: 'lost',
        endedAt: at,
      })
    } else if (isCleared(next)) {
      const endedAt = at
      submit(Math.floor((endedAt - startedAt) / 1000))
      sfx.win()
      setGame({
        ...game,
        startedAt,
        field: next.map((c) => (c.mine ? { ...c, flag: true } : c)),
        status: 'won',
        endedAt,
      })
    } else {
      sfx.tap()
      setGame({ ...game, startedAt, field: next, status: 'playing' })
    }
  }

  const toggleFlag = (i: number) => {
    const cell = game.field[i]
    if (cell.open || game.status === 'won' || game.status === 'lost') return
    setGame({ ...game, field: game.field.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)) })
  }

  /** `at` is the click's event timestamp (same clock as performance.now). */
  const handleTap = (i: number, at: number) => {
    if (game.status === 'won' || game.status === 'lost') return
    if (flagMode) return toggleFlag(i)
    const cell = game.field[i]
    if (cell.flag) return
    if (game.status === 'idle') {
      setNow(at)
      return open(plantMines(rows, cols, mines, i), [i], at, at)
    }
    // Tapping a number whose flags are all placed opens the rest around it.
    if (cell.open) {
      const around = neighbors(i, rows, cols)
      if (cell.adj > 0 && around.filter((n) => game.field[n].flag).length === cell.adj)
        open(
          game.field,
          around.filter((n) => !game.field[n].open && !game.field[n].flag),
          game.startedAt,
          at,
        )
      return
    }
    open(game.field, [i], game.startedAt, at)
  }

  const done = game.status === 'won' || game.status === 'lost'

  return (
    <GameShell
      title="مین‌یاب"
      stats={[
        { label: 'مین', value: toFaDigits(mines - flags) },
        { label: 'زمان', value: toFaDigits(elapsed) },
        { label: 'بهترین', value: best === null ? '—' : toFaDigits(best) },
      ]}
      overlay={
        done
          ? {
              title: game.status === 'won' ? 'آفرین! همه پیدا شدند' : 'بوم! روی مین رفتی',
              detail: game.status === 'won' ? formatSeconds(elapsed) : undefined,
              action: 'دوباره',
              onAction: () => setGame(freshGame(game.level)),
            }
          : null
      }
      scores={scores}
      formatScore={formatSeconds}
      before={
        <div className="flex items-center gap-2">
          {(Object.keys(LEVELS) as Level[]).map((level) => (
            <Button
              key={level}
              size="sm"
              variant={game.level === level ? 'default' : 'secondary'}
              aria-pressed={game.level === level}
              onClick={() => setGame(freshGame(level))}
            >
              {LEVELS[level].label}
            </Button>
          ))}
          <Button
            size="sm"
            className="ms-auto"
            variant={flagMode ? 'default' : 'outline'}
            aria-pressed={flagMode}
            onClick={() => setFlagMode(!flagMode)}
          >
            <Flag /> پرچم
          </Button>
        </div>
      }
      after={
        <Button variant="outline" onClick={() => setGame(freshGame(game.level))}>
          <RotateCcw /> شروع دوباره
        </Button>
      }
    >
      <div
        dir="ltr"
        role="grid"
        aria-label="میدان مین"
        className="@container grid gap-[2px] rounded-2xl glass p-1.5 select-none"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          width: `min(100cqw, calc(100cqh * ${cols / rows}))`,
        }}
      >
        {game.field.map((cell, i) => (
          <button
            key={i}
            type="button"
            role="gridcell"
            aria-label={
              cell.open ? (cell.mine ? 'مین' : cell.adj ? toFaDigits(cell.adj) : 'خالی') : cell.flag ? 'پرچم' : 'بسته'
            }
            className={cn(
              'flex aspect-square items-center justify-center rounded-[4px] font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring',
              cols > 10 ? 'text-[5cqw]' : 'text-[6cqw]',
              cell.open ? (cell.mine ? 'bg-destructive/80' : 'bg-transparent') : 'bg-secondary active:bg-accent',
              cell.open && NUMBER_COLORS[cell.adj],
            )}
            onClick={(e) => handleTap(i, e.timeStamp)}
            onContextMenu={(e) => {
              e.preventDefault()
              toggleFlag(i)
            }}
          >
            {cell.open ? (cell.mine ? '💣' : cell.adj ? toFaDigits(cell.adj) : '') : cell.flag ? '🚩' : ''}
          </button>
        ))}
      </div>
    </GameShell>
  )
}

export default MinesView
