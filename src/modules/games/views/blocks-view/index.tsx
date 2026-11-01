import { useRef, type PointerEvent } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, RotateCw } from 'lucide-react'
import { GameCanvas, GameShell } from '#/modules/games/components/game-shell'
import { useArcade } from '#/modules/games/hooks/arcade.hook'
import { useCanvasGame, useKeys } from '#/modules/games/hooks/canvas-game.hook'
import {
  COLS,
  LINE_POINTS,
  ROWS,
  SHAPES,
  clearLines,
  dropDistance,
  emptyBoard,
  fits,
  lockPiece,
  newBag,
  rotatePiece,
  spawnPiece,
  type Piece,
} from '#/modules/games/utils/blocks'
import { sfx } from '#/modules/games/utils/sfx'
import { toFaDigits } from '#/modules/shell/utils/format'
import { Button } from '#/components/button'

const CELL = 20
const PANEL = 84
const W = COLS * CELL + PANEL
const H = ROWS * CELL
const COLORS = ['#06b6d4', '#eab308', '#a855f7', '#22c55e', '#ef4444', '#3b82f6', '#f97316']

const newGame = () => {
  const bag = [...newBag(), ...newBag()]
  return {
    board: emptyBoard(),
    piece: spawnPiece(bag.shift()!),
    bag,
    lines: 0,
    level: 1,
    score: 0,
    acc: 0,
    over: false,
  }
}

const BlocksView = () => {
  const arcade = useArcade('blocks', {
    title: 'بلوک‌ریز',
    detail: 'لمس = چرخش، کشیدن = جابه‌جایی، کشیدن سریع رو به پایین = سقوط.',
  })
  const game = useRef(newGame())
  const drag = useRef<{ x: number; y: number; moved: boolean; t: number } | null>(null)
  const playing = arcade.status === 'playing'

  const start = () => {
    game.current = newGame()
    arcade.begin()
  }

  const lock = () => {
    const g = game.current
    const { board, cleared } = clearLines(lockPiece(g.board, g.piece))
    g.board = board
    if (cleared) {
      g.lines += cleared
      g.score += LINE_POINTS[cleared] * g.level
      g.level = 1 + Math.floor(g.lines / 10)
      arcade.setScore(g.score)
      sfx.point()
    } else sfx.tap()
    if (g.bag.length < 7) g.bag.push(...newBag())
    g.piece = spawnPiece(g.bag.shift()!)
    g.acc = 0
    if (!fits(g.board, g.piece.cells, g.piece.x, g.piece.y)) {
      g.over = true
      arcade.end(g.score)
    }
  }

  const act = (action: 'left' | 'right' | 'rotate' | 'down' | 'drop') => {
    const g = game.current
    if (!playing || g.over) return
    const p = g.piece
    if (action === 'rotate') g.piece = rotatePiece(g.board, p)
    else if (action === 'left' || action === 'right') {
      const x = p.x + (action === 'left' ? -1 : 1)
      if (fits(g.board, p.cells, x, p.y)) g.piece = { ...p, x }
    } else if (action === 'down') {
      if (fits(g.board, p.cells, p.x, p.y + 1)) {
        g.piece = { ...p, y: p.y + 1 }
        g.acc = 0
      } else lock()
    } else {
      g.piece = { ...p, y: p.y + dropDistance(g.board, p) }
      lock()
    }
  }

  const drawCell = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = CELL) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(x + 1, y + 1, size - 2, size - 2, 4)
    ctx.fill()
  }

  const drawPiece = (ctx: CanvasRenderingContext2D, p: Piece, y: number) =>
    p.cells.forEach(([cx, cy]) => p.y + cy >= 0 && drawCell(ctx, (p.x + cx) * CELL, (y + cy) * CELL, COLORS[p.kind]))

  const { canvasRef } = useCanvasGame(W, H, (ctx, dt, pal) => {
    const g = game.current
    if (playing && !g.over) {
      g.acc += dt
      const interval = Math.max(0.06, 0.8 * Math.pow(0.85, g.level - 1))
      if (g.acc >= interval) {
        g.acc = 0
        if (fits(g.board, g.piece.cells, g.piece.x, g.piece.y + 1)) g.piece = { ...g.piece, y: g.piece.y + 1 }
        else lock()
      }
    }

    ctx.strokeStyle = pal.line
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let c = 1; c < COLS; c++) {
      ctx.moveTo(c * CELL, 0)
      ctx.lineTo(c * CELL, H)
    }
    for (let r = 1; r < ROWS; r++) {
      ctx.moveTo(0, r * CELL)
      ctx.lineTo(COLS * CELL, r * CELL)
    }
    ctx.stroke()

    g.board.forEach((v, i) => v && drawCell(ctx, (i % COLS) * CELL, Math.floor(i / COLS) * CELL, COLORS[v - 1]))
    if (!g.over) {
      ctx.globalAlpha = 0.22
      drawPiece(ctx, g.piece, g.piece.y + dropDistance(g.board, g.piece))
      ctx.globalAlpha = 1
      drawPiece(ctx, g.piece, g.piece.y)
    }

    // Side panel: next piece, lines, level.
    const px = COLS * CELL
    ctx.fillStyle = pal.line
    ctx.fillRect(px, 0, PANEL, H)
    ctx.fillStyle = pal.muted
    ctx.font = '600 12px Vazirmatn Variable, system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('بعدی', px + PANEL / 2, 22)
    const next = SHAPES[g.bag[0]]
    next.cells.forEach(([cx, cy]) =>
      drawCell(ctx, px + PANEL / 2 + (cx - next.box / 2) * 16, 34 + cy * 16, COLORS[g.bag[0]], 16),
    )
    ctx.fillText('ردیف', px + PANEL / 2, 120)
    ctx.fillText('سطح', px + PANEL / 2, 180)
    ctx.fillStyle = pal.fg
    ctx.font = '700 20px Vazirmatn Variable, system-ui'
    ctx.fillText(toFaDigits(g.lines), px + PANEL / 2, 146)
    ctx.fillText(toFaDigits(g.level), px + PANEL / 2, 206)
  })

  useKeys((e) => {
    const map: Record<string, Parameters<typeof act>[0]> = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'rotate',
      KeyX: 'rotate',
      ArrowDown: 'down',
      Space: 'drop',
    }
    const action = map[e.code]
    if (!action) return
    e.preventDefault()
    act(action)
  })

  const handlePointerDown = (e: PointerEvent) =>
    (drag.current = { x: e.clientX, y: e.clientY, moved: false, t: performance.now() })
  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current
    if (!d) return
    const step = (e.currentTarget.clientWidth / W) * CELL
    const dx = e.clientX - d.x
    if (Math.abs(dx) >= step) {
      act(dx < 0 ? 'left' : 'right')
      d.x += Math.sign(dx) * step
      d.moved = true
    }
  }
  const handlePointerUp = (e: PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const dy = e.clientY - d.y
    if (dy > 50 && performance.now() - d.t < 300) act('drop')
    else if (!d.moved && Math.abs(dy) < 10) act('rotate')
  }

  const controls = [
    { action: 'left', icon: ArrowLeft, label: 'چپ' },
    { action: 'rotate', icon: RotateCw, label: 'چرخش' },
    { action: 'down', icon: ArrowDown, label: 'پایین' },
    { action: 'drop', icon: ChevronsDown, label: 'سقوط' },
    { action: 'right', icon: ArrowRight, label: 'راست' },
  ] as const

  return (
    <GameShell
      title="بلوک‌ریز"
      stats={arcade.stats}
      overlay={arcade.overlay}
      onRestart={start}
      onPause={arcade.pause}
      scores={arcade.scores}
      after={
        <div dir="ltr" className="grid grid-cols-5 gap-2">
          {controls.map(({ action, icon: Icon, label }) => (
            <Button
              key={action}
              variant="outline"
              size="lg"
              disabled={!playing}
              aria-label={label}
              onClick={() => act(action)}
            >
              <Icon />
            </Button>
          ))}
        </div>
      }
    >
      <GameCanvas
        ref={canvasRef}
        width={W}
        height={H}
        label="صفحهٔ بلوک‌ریز"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => (drag.current = null)}
      />
    </GameShell>
  )
}

export default BlocksView
