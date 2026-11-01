import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { GameShell } from '#/modules/games/components/game-shell'
import { useScores } from '#/modules/games/hooks/scores.hook'
import { sfx } from '#/modules/games/utils/sfx'
import { cn } from '#/modules/shell/utils/cn'
import { toFaDigits } from '#/modules/shell/utils/format'
import { Button } from '#/components/button'

const SIZES = {
  small: { label: '۱۲ کارت', cols: 3, pairs: 6 },
  medium: { label: '۱۶ کارت', cols: 4, pairs: 8 },
  large: { label: '۲۰ کارت', cols: 4, pairs: 10 },
}
type Size = keyof typeof SIZES

const FACES = ['🌵', '🌻', '🍄', '🐝', '🦋', '🐢', '🍉', '🌙', '⭐', '🍁', '🐙', '🎈']

type Card = { face: string; matched: boolean }

const deal = (size: Size): Card[] => {
  const faces = [...FACES].sort(() => Math.random() - 0.5).slice(0, SIZES[size].pairs)
  const cards = [...faces, ...faces].map((face) => ({ face, matched: false }))
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

const MemoryView = () => {
  const [size, setSize] = useState<Size>('medium')
  const [cards, setCards] = useState(() => deal('medium'))
  const [open, setOpen] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const { scores, best, submit } = useScores(`memory-${size}`, true)
  const done = cards.every((c) => c.matched)

  // Two cards up: keep a match, flip a miss back after a moment.
  useEffect(() => {
    if (open.length !== 2) return
    const [a, b] = open
    const hit = cards[a].face === cards[b].face
    const id = setTimeout(
      () => {
        setOpen([])
        if (!hit) return
        const next = cards.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))
        setCards(next)
        if (next.every((c) => c.matched)) {
          submit(moves)
          sfx.win()
        } else sfx.point()
      },
      hit ? 250 : 750,
    )
    return () => clearTimeout(id)
  }, [open, cards, moves, submit])

  const restart = (next: Size = size) => {
    setSize(next)
    setCards(deal(next))
    setOpen([])
    setMoves(0)
  }

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || cards[i].matched) return
    sfx.tap()
    setOpen([...open, i])
    if (open.length === 1) setMoves(moves + 1)
  }

  return (
    <GameShell
      title="کارت حافظه"
      stats={[
        { label: 'حرکت', value: toFaDigits(moves) },
        { label: 'بهترین', value: best === null ? '—' : toFaDigits(best) },
      ]}
      overlay={
        done
          ? { title: 'آفرین!', detail: `با ${toFaDigits(moves)} حرکت`, action: 'دوباره', onAction: () => restart() }
          : null
      }
      scores={scores}
      formatScore={(s) => `${toFaDigits(s)} حرکت`}
      before={
        <div className="flex gap-2">
          {(Object.keys(SIZES) as Size[]).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={size === s ? 'default' : 'secondary'}
              aria-pressed={size === s}
              onClick={() => restart(s)}
            >
              {SIZES[s].label}
            </Button>
          ))}
        </div>
      }
      after={
        <Button variant="outline" onClick={() => restart()}>
          <RotateCcw /> شروع دوباره
        </Button>
      }
    >
      <div
        className="@container grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${SIZES[size].cols}, minmax(0, 1fr))`,
          width: `min(100cqw, calc(100cqh * ${SIZES[size].cols / ((SIZES[size].pairs * 2) / SIZES[size].cols)}))`,
        }}
      >
        {cards.map((card, i) => {
          const up = card.matched || open.includes(i)
          return (
            <button
              key={i}
              type="button"
              aria-label={up ? card.face : 'کارت بسته'}
              className="aspect-square rounded-xl outline-none perspective-distant focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={() => flip(i)}
            >
              <span
                className={cn(
                  'relative block size-full transition-transform duration-300 transform-3d',
                  up && 'rotate-y-180',
                )}
                aria-hidden
              >
                <span className="absolute inset-0 rounded-xl bg-primary/85 backface-hidden" />
                <span
                  className={cn(
                    'absolute inset-0 flex rotate-y-180 items-center justify-center rounded-xl glass text-[min(10cqw,2.5rem)] backface-hidden',
                    card.matched && 'opacity-60',
                  )}
                >
                  {card.face}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </GameShell>
  )
}

export default MemoryView
