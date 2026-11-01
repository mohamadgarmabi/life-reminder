import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import { z } from 'zod'
import { GameShell } from '#/modules/games/components/game-shell'
import { useKeys } from '#/modules/games/hooks/canvas-game.hook'
import { useScores } from '#/modules/games/hooks/scores.hook'
import { loadGameData, saveGameData } from '#/modules/games/utils/game-db'
import { MERGE_SIZE, canMove, slideTiles, spawnTile, type Direction, type MergeTile } from '#/modules/games/utils/merge'
import { sfx } from '#/modules/games/utils/sfx'
import { cn } from '#/modules/shell/utils/cn'
import { toFaDigits } from '#/modules/shell/utils/format'
import { Button } from '#/components/button'

const COLORS = [
  'bg-stone-200 text-stone-700',
  'bg-amber-100 text-stone-700',
  'bg-orange-300 text-white',
  'bg-orange-400 text-white',
  'bg-orange-500 text-white',
  'bg-red-500 text-white',
  'bg-yellow-400 text-white',
  'bg-yellow-500 text-white',
  'bg-lime-500 text-white',
  'bg-emerald-500 text-white',
  'bg-sky-500 text-white',
  'bg-violet-500 text-white',
]

const KEYS: Record<string, Direction> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  KeyA: 'left',
  KeyD: 'right',
  KeyW: 'up',
  KeyS: 'down',
}

type MergeState = { tiles: MergeTile[]; score: number; nextId: number; over: boolean }

const stateSchema = z.object({
  tiles: z.array(z.object({ id: z.number(), value: z.number(), r: z.number(), c: z.number() })),
  score: z.number(),
  nextId: z.number(),
  over: z.boolean(),
})

const freshGame = (): MergeState => ({ tiles: spawnTile(spawnTile([], 1), 2), score: 0, nextId: 3, over: false })

const MergeView = () => {
  const { scores, best, submit } = useScores('merge')
  const [game, setGame] = useState(freshGame)
  const swipe = useRef<{ x: number; y: number } | null>(null)

  // Resume the last board.
  useEffect(() => {
    void loadGameData('merge:state', stateSchema).then((saved) => saved && setGame(saved))
  }, [])

  const commit = (next: MergeState) => {
    setGame(next)
    void saveGameData('merge:state', { ...next, tiles: next.tiles.filter((t) => !t.gone) })
  }

  const move = (dir: Direction) => {
    if (game.over) return
    const { tiles, moved, gained } = slideTiles(game.tiles, dir)
    if (!moved) return
    const spawned = spawnTile(tiles, game.nextId)
    const score = game.score + gained
    const over = !canMove(spawned)
    if (over) {
      submit(score)
      sfx.lose()
    } else if (gained) sfx.point()
    else sfx.tap()
    commit({ tiles: spawned, score, nextId: game.nextId + 1, over })
  }

  useKeys((e) => {
    const dir = KEYS[e.code]
    if (!dir) return
    e.preventDefault()
    move(dir)
  })

  const handlePointerUp = (e: PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
  }

  return (
    <GameShell
      title="ادغام اعداد"
      stats={[
        { label: 'امتیاز', value: toFaDigits(game.score) },
        { label: 'بهترین', value: toFaDigits(Math.max(best ?? 0, game.score)) },
      ]}
      overlay={
        game.over
          ? {
              title: 'حرکتی نمانده',
              detail: `امتیاز: ${toFaDigits(game.score)}`,
              action: 'بازی تازه',
              onAction: () => commit(freshGame()),
            }
          : null
      }
      scores={scores}
      after={
        <Button variant="outline" onClick={() => commit(freshGame())}>
          <RotateCcw /> بازی تازه
        </Button>
      }
    >
      <div
        dir="ltr"
        role="grid"
        aria-label="صفحهٔ ادغام؛ با کشیدن یا کلیدهای جهت حرکت بده"
        className="@container relative mx-auto aspect-square w-[min(100cqw,100cqh)] touch-none rounded-2xl bg-secondary p-[1.5%] select-none"
        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => (swipe.current = null)}
      >
        <div className="relative size-full">
          {Array.from({ length: MERGE_SIZE * MERGE_SIZE }, (_, i) => (
            <div
              key={i}
              className="absolute size-1/4 p-[1.5%]"
              style={{ transform: `translate(${(i % MERGE_SIZE) * 100}%, ${Math.floor(i / MERGE_SIZE) * 100}%)` }}
            >
              <div className="size-full rounded-xl bg-card/60" />
            </div>
          ))}
          {game.tiles.map((t) => {
            const digits = String(t.value).length
            return (
              <div
                key={t.id}
                role="gridcell"
                aria-label={String(t.value)}
                className={cn(
                  'absolute size-1/4 p-[1.5%] transition-transform duration-120 ease-out will-change-transform',
                  t.gone ? 'z-0' : 'z-10',
                )}
                style={{ transform: `translate(${t.c * 100}%, ${t.r * 100}%)` }}
              >
                <div
                  key={t.value}
                  className={cn(
                    'flex size-full items-center justify-center rounded-xl font-bold',
                    COLORS[Math.min(Math.log2(t.value) - 1, COLORS.length - 1)],
                    digits <= 2 ? 'text-[11cqw]' : digits === 3 ? 'text-[8.5cqw]' : 'text-[6.5cqw]',
                    t.merged && 'animate-in zoom-in-75 duration-150',
                    t.fresh && 'animate-in zoom-in-50 fade-in delay-75 duration-150 fill-mode-backwards',
                  )}
                >
                  {toFaDigits(t.value)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}

export default MergeView
