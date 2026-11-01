import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { z } from 'zod'
import { GameShell } from '#/modules/games/components/game-shell'
import {
  C4_COLS,
  C4_ROWS,
  bestColumn,
  dropDisc,
  emptyConnect,
  landingRow,
  outcome,
  winningLine,
} from '#/modules/games/utils/connect4'
import { loadGameData, saveGameData } from '#/modules/games/utils/game-db'
import { sfx } from '#/modules/games/utils/sfx'
import { cn } from '#/modules/shell/utils/cn'
import { toFaDigits } from '#/modules/shell/utils/format'
import { Button } from '#/components/button'

const LEVELS = {
  easy: { label: 'آسان', depth: 2 },
  medium: { label: 'متوسط', depth: 4 },
  hard: { label: 'سخت', depth: 7 },
}
type Level = keyof typeof LEVELS

const recordSchema = z.object({ win: z.number(), loss: z.number(), draw: z.number() })
const ZERO = { win: 0, loss: 0, draw: 0 }

const Connect4View = () => {
  const [level, setLevel] = useState<Level>('medium')
  const [board, setBoard] = useState(emptyConnect)
  const [last, setLast] = useState<number | null>(null)
  const [thinking, setThinking] = useState(false)
  const [records, setRecords] = useState<Partial<Record<Level, z.infer<typeof recordSchema>>>>({})
  const result = outcome(board)
  const line = winningLine(board)
  const record = records[level] ?? ZERO

  useEffect(() => {
    void loadGameData('connect4:records', z.record(z.string(), recordSchema)).then(
      (saved) => saved && setRecords(saved),
    )
  }, [])

  const finish = (b: number[]) => {
    const r = outcome(b)
    if (!r) return
    const key = r === 1 ? 'win' : r === 2 ? 'loss' : 'draw'
    const next = { ...records, [level]: { ...record, [key]: record[key] + 1 } }
    setRecords(next)
    void saveGameData('connect4:records', next)
    if (r === 1) sfx.win()
    else sfx.lose()
  }

  // Computer replies after a short pause so the player's disc lands first.
  useEffect(() => {
    if (!thinking) return
    const id = setTimeout(() => {
      // Easy plays a random column now and then, so it can be beaten.
      const random = level === 'easy' && Math.random() < 0.3
      const open = [...Array(C4_COLS).keys()].filter((c) => landingRow(board, c) >= 0)
      const col = random ? open[Math.floor(Math.random() * open.length)] : bestColumn(board, LEVELS[level].depth)
      const next = dropDisc(board, col, 2)
      setThinking(false)
      if (!next) return
      setBoard(next)
      setLast(landingRow(board, col) * C4_COLS + col)
      sfx.tap()
      finish(next)
    }, 350)
    return () => clearTimeout(id)
  })

  const play = (col: number) => {
    if (thinking || result) return
    const next = dropDisc(board, col, 1)
    if (!next) return
    setLast(landingRow(board, col) * C4_COLS + col)
    setBoard(next)
    sfx.tap()
    if (outcome(next)) finish(next)
    else setThinking(true)
  }

  const restart = (next: Level = level) => {
    setLevel(next)
    setBoard(emptyConnect())
    setLast(null)
    setThinking(false)
  }

  return (
    <GameShell
      title="چهار در یک ردیف"
      stats={[
        { label: 'برد', value: toFaDigits(record.win) },
        { label: 'باخت', value: toFaDigits(record.loss) },
        { label: 'مساوی', value: toFaDigits(record.draw) },
      ]}
      before={
        <div className="flex items-center gap-2">
          {(Object.keys(LEVELS) as Level[]).map((l) => (
            <Button
              key={l}
              size="sm"
              variant={level === l ? 'default' : 'secondary'}
              aria-pressed={level === l}
              onClick={() => restart(l)}
            >
              {LEVELS[l].label}
            </Button>
          ))}
          <span className="ms-auto text-sm text-muted-foreground" role="status">
            {result === 1
              ? 'بردی! 🎉'
              : result === 2
                ? 'رایانه برد'
                : result === 3
                  ? 'مساوی'
                  : thinking
                    ? 'رایانه فکر می‌کند…'
                    : 'نوبت توست'}
          </span>
        </div>
      }
      after={
        <Button variant="outline" onClick={() => restart()}>
          <RotateCcw /> بازی تازه
        </Button>
      }
    >
      <div
        dir="ltr"
        className="grid w-[min(100cqw,calc(100cqh*1.1))] grid-cols-7 gap-1 rounded-3xl bg-blue-600 p-2"
        role="group"
        aria-label="صفحهٔ بازی"
      >
        {Array.from({ length: C4_COLS }, (_, col) => (
          <button
            key={col}
            type="button"
            aria-label={`ستون ${toFaDigits(col + 1)}`}
            disabled={thinking || !!result || landingRow(board, col) < 0}
            className="flex flex-col gap-1 rounded-lg outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white disabled:cursor-default"
            onClick={() => play(col)}
          >
            {Array.from({ length: C4_ROWS }, (_, row) => {
              const i = row * C4_COLS + col
              const v = board[i]
              return (
                <span key={row} className="aspect-square w-full rounded-full bg-blue-900/50 p-[8%]">
                  {v > 0 && (
                    <span
                      className={cn(
                        'block size-full rounded-full',
                        v === 1 ? 'bg-red-500' : 'bg-yellow-400',
                        i === last && 'animate-in fade-in zoom-in-50 duration-200',
                        line?.includes(i) && 'ring-4 ring-white',
                      )}
                    />
                  )}
                </span>
              )
            })}
          </button>
        ))}
      </div>
    </GameShell>
  )
}

export default Connect4View
