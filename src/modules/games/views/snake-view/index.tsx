import { useRef, type PointerEvent } from 'react'
import { GameCanvas, GameShell } from '#/modules/games/components/game-shell'
import { useArcade } from '#/modules/games/hooks/arcade.hook'
import { useCanvasGame, useKeys } from '#/modules/games/hooks/canvas-game.hook'
import { sfx } from '#/modules/games/utils/sfx'
import { createSnake, stepSnake, turnSnake, type Point } from '#/modules/games/utils/snake'

const SIZE = 18
const CELL = 20
const WORLD = SIZE * CELL

const KEYS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyW: { x: 0, y: -1 },
  KeyS: { x: 0, y: 1 },
  KeyA: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 },
}

const SnakeView = () => {
  const arcade = useArcade('snake', { title: 'مار', detail: 'انگشتت را بکش یا از کلیدهای جهت استفاده کن.' })
  const game = useRef({ s: createSnake(SIZE), prev: [] as Point[], acc: 0 })
  const swipe = useRef<{ x: number; y: number } | null>(null)

  const start = () => {
    game.current = { s: createSnake(SIZE), prev: [], acc: 0 }
    arcade.begin()
  }

  const { canvasRef } = useCanvasGame(WORLD, WORLD, (ctx, dt, pal) => {
    const g = game.current
    const interval = Math.max(0.065, 0.14 - g.s.score * 0.0025)
    if (arcade.status === 'playing' && g.s.alive) {
      g.acc += dt
      while (g.acc >= interval) {
        g.acc -= interval
        g.prev = g.s.body
        const next = stepSnake(g.s)
        if (next.score > g.s.score) {
          sfx.point()
          arcade.setScore(next.score)
        }
        g.s = next
        if (!next.alive) {
          arcade.end(next.score)
          break
        }
      }
    }

    ctx.fillStyle = pal.line
    for (let y = 0; y < SIZE; y++) for (let x = y % 2; x < SIZE; x += 2) ctx.fillRect(x * CELL, y * CELL, CELL, CELL)

    const { food, body } = g.s
    const pulse = 1 + Math.sin(performance.now() / 180) * 0.08
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc((food.x + 0.5) * CELL, (food.y + 0.5) * CELL, CELL * 0.36 * pulse, 0, Math.PI * 2)
    ctx.fill()

    // Segments glide between grid cells, so movement stays smooth at any refresh rate.
    const t = g.s.alive ? Math.min(g.acc / interval, 1) : 1
    const pts = body.map((p, i) => {
      const from = g.prev[i] ?? p
      return { x: (from.x + (p.x - from.x) * t + 0.5) * CELL, y: (from.y + (p.y - from.y) * t + 0.5) * CELL }
    })
    ctx.strokeStyle = g.s.alive ? '#22c55e' : '#a3a3a3'
    ctx.lineWidth = CELL * 0.72
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
    ctx.stroke()
    ctx.fillStyle = pal.dark ? '#000' : '#fff'
    const head = pts[0]
    const { dir } = g.s
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.arc(head.x + dir.x * 3 - dir.y * side * 4, head.y + dir.y * 3 + dir.x * side * 4, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  const turn = (d: Point) => {
    if (arcade.status === 'playing') game.current.s = turnSnake(game.current.s, d)
  }

  useKeys((e) => {
    const d = KEYS[e.code]
    if (!d) return
    e.preventDefault()
    turn(d)
  })

  const handlePointerDown = (e: PointerEvent) => (swipe.current = { x: e.clientX, y: e.clientY })
  const handlePointerMove = (e: PointerEvent) => {
    const s = swipe.current
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return
    turn(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) })
    swipe.current = { x: e.clientX, y: e.clientY }
  }

  return (
    <GameShell
      title="مار"
      stats={arcade.stats}
      overlay={arcade.overlay}
      onRestart={start}
      onPause={arcade.pause}
      scores={arcade.scores}
    >
      <GameCanvas
        ref={canvasRef}
        width={WORLD}
        height={WORLD}
        label="صفحهٔ بازی مار"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => (swipe.current = null)}
        onPointerCancel={() => (swipe.current = null)}
      />
    </GameShell>
  )
}

export default SnakeView
