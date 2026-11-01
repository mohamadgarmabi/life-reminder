import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Undo2 } from 'lucide-react'
import { z } from 'zod'
import { GameShell } from '#/modules/games/components/game-shell'
import { loadGameData, saveGameData } from '#/modules/games/utils/game-db'
import { sfx } from '#/modules/games/utils/sfx'
import { CAPACITY, canPour, generateWater, isSorted, pour, type Tubes } from '#/modules/games/utils/water'
import { cn } from '#/modules/shell/utils/cn'
import { toFaDigits } from '#/modules/shell/utils/format'
import { Button } from '#/components/button'

const COLORS = [
  { bg: 'bg-red-500', name: 'قرمز' },
  { bg: 'bg-blue-500', name: 'آبی' },
  { bg: 'bg-yellow-400', name: 'زرد' },
  { bg: 'bg-green-500', name: 'سبز' },
  { bg: 'bg-violet-500', name: 'بنفش' },
  { bg: 'bg-orange-500', name: 'نارنجی' },
  { bg: 'bg-pink-400', name: 'صورتی' },
  { bg: 'bg-cyan-400', name: 'فیروزه‌ای' },
  { bg: 'bg-lime-400', name: 'لیمویی' },
  { bg: 'bg-amber-800', name: 'قهوه‌ای' },
]

const progressSchema = z.object({ level: z.number().int().min(1), unlocked: z.number().int().min(1) })

type WaterState = { level: number; unlocked: number; tubes: Tubes; history: Tubes[]; selected: number | null }

const atLevel = (level: number, unlocked: number): WaterState => ({
  level,
  unlocked,
  tubes: generateWater(level),
  history: [],
  selected: null,
})

const WaterView = () => {
  const [game, setGame] = useState(() => atLevel(1, 1))
  const solved = isSorted(game.tubes)

  useEffect(() => {
    void loadGameData('water:progress', progressSchema).then(
      (saved) => saved && setGame(atLevel(saved.level, saved.unlocked)),
    )
  }, [])

  const goTo = (level: number, unlocked = game.unlocked) => {
    setGame(atLevel(level, unlocked))
    void saveGameData('water:progress', { level, unlocked })
  }

  const handleTube = (i: number) => {
    if (solved) return
    const { tubes, selected } = game
    if (selected === null || selected === i) {
      setGame({ ...game, selected: selected === i || !tubes[i].length ? null : i })
      return
    }
    if (!canPour(tubes, selected, i)) {
      setGame({ ...game, selected: tubes[i].length ? i : null })
      return
    }
    const next = pour(tubes, selected, i)
    setGame({ ...game, tubes: next, history: [...game.history, tubes], selected: null })
    if (isSorted(next)) {
      sfx.win()
      const unlocked = Math.max(game.unlocked, game.level + 1)
      void saveGameData('water:progress', { level: game.level, unlocked })
      setGame({ ...game, tubes: next, history: [...game.history, tubes], selected: null, unlocked })
    } else sfx.tap()
  }

  const undo = () =>
    game.history.length &&
    setGame({ ...game, tubes: game.history.at(-1)!, history: game.history.slice(0, -1), selected: null })

  return (
    <GameShell
      title="رنگ‌چین"
      stats={[
        { label: 'مرحله', value: toFaDigits(game.level) },
        { label: 'حرکت', value: toFaDigits(game.history.length) },
      ]}
      overlay={
        solved
          ? {
              title: 'مرتب شد!',
              detail: `در ${toFaDigits(game.history.length)} حرکت`,
              action: 'مرحله بعد',
              onAction: () => goTo(game.level + 1),
            }
          : null
      }
      after={
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={game.level === 1}
            onClick={() => goTo(game.level - 1)}
            aria-label="مرحله قبل"
          >
            <ChevronRight />
          </Button>
          <Button variant="outline" disabled={!game.history.length || solved} onClick={undo}>
            <Undo2 /> برگرد
          </Button>
          <Button variant="outline" onClick={() => goTo(game.level)}>
            <RotateCcw /> از اول
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={game.level >= game.unlocked}
            onClick={() => goTo(game.level + 1)}
            aria-label="مرحله بعد"
          >
            <ChevronLeft />
          </Button>
        </div>
      }
    >
      <div dir="ltr" className="flex w-full flex-wrap content-center justify-center gap-x-3 gap-y-6 py-4">
        {game.tubes.map((tube, i) => (
          <button
            key={i}
            type="button"
            aria-label={`لولهٔ ${toFaDigits(i + 1)}: ${tube.length ? tube.map((c) => COLORS[c].name).join('، ') : 'خالی'}`}
            aria-pressed={game.selected === i}
            className={cn(
              'flex h-[clamp(8rem,34cqh,12rem)] w-12 flex-col-reverse gap-0.5 overflow-hidden rounded-t-md rounded-b-full border-2 border-foreground/25 p-1 transition-transform duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
              game.selected === i && '-translate-y-3 border-foreground/60',
            )}
            onClick={() => handleTube(i)}
          >
            {tube.map((c, j) => (
              <span
                key={j}
                className={cn('w-full shrink-0 first:rounded-b-full', COLORS[c].bg)}
                style={{ height: `calc((100% - ${(CAPACITY - 1) * 2}px) / ${CAPACITY})` }}
              />
            ))}
          </button>
        ))}
      </div>
    </GameShell>
  )
}

export default WaterView
