import { useRef, type PointerEvent } from 'react'
import type { Match3BoardProps } from '#/modules/games/types'
import { SIZE } from '#/modules/games/utils/match3'
import { cn } from '#/modules/shell/utils/cn'

// Own palette (no external art): emoji on tinted gems.
const KINDS = [
  { emoji: '🌸', bg: 'bg-pink-400/30', label: 'شکوفه' },
  { emoji: '🍋', bg: 'bg-yellow-400/30', label: 'لیمو' },
  { emoji: '🍀', bg: 'bg-green-500/30', label: 'شبدر' },
  { emoji: '💧', bg: 'bg-sky-400/30', label: 'قطره' },
  { emoji: '🔥', bg: 'bg-orange-500/30', label: 'آتش' },
  { emoji: '🍇', bg: 'bg-violet-500/30', label: 'انگور' },
]

const useMatch3Board = ({ grid, clearing, spawned, selected, onTap, onSwap }: Match3BoardProps) => {
  const drag = useRef<{ index: number; x: number; y: number } | null>(null)
  // A swipe that ends on its own tile would also fire that tile's click.
  const swiped = useRef(false)

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    swiped.current = false
    const rect = e.currentTarget.getBoundingClientRect()
    const c = Math.floor(((e.clientX - rect.left) / rect.width) * SIZE)
    const r = Math.floor(((e.clientY - rect.top) / rect.height) * SIZE)
    drag.current = r >= 0 && r < SIZE && c >= 0 && c < SIZE ? { index: r * SIZE + c, x: e.clientX, y: e.clientY } : null
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = drag.current
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    const threshold = (e.currentTarget.getBoundingClientRect().width / SIZE) * 0.35
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return
    drag.current = null
    swiped.current = true
    const r = Math.floor(start.index / SIZE)
    const c = start.index % SIZE
    const [tr, tc] = Math.abs(dx) > Math.abs(dy) ? [r, c + Math.sign(dx)] : [r + Math.sign(dy), c]
    if (tr >= 0 && tr < SIZE && tc >= 0 && tc < SIZE) onSwap(start.index, tr * SIZE + tc)
  }

  const tiles = grid.flatMap((tile, i) => {
    if (!tile) return []
    const kind = KINDS[tile.kind]
    return [
      {
        id: tile.id,
        index: i,
        emoji: kind.emoji,
        label: kind.label,
        style: { transform: `translate(${(i % SIZE) * 100}%, ${Math.floor(i / SIZE) * 100}%)` },
        innerClassName: cn(
          'flex size-full items-center justify-center rounded-xl text-[clamp(1rem,6cqw,2rem)] transition-[scale,opacity,box-shadow] duration-200',
          kind.bg,
          spawned.has(tile.id) && 'animate-in zoom-in-0 fade-in duration-300',
          clearing.has(tile.id) && 'scale-0 opacity-0',
          selected === i && 'scale-90 ring-2 ring-primary',
        ),
      },
    ]
  })

  return {
    tiles,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd: () => (drag.current = null),
    handleTileClick: (index: number) => !swiped.current && onTap(index),
  }
}

export { useMatch3Board }
