import { useRef, type PointerEvent } from 'react'
import { GameCanvas, GameShell } from '#/modules/games/components/game-shell'
import { useArcade } from '#/modules/games/hooks/arcade.hook'
import { useCanvasGame, useKeys } from '#/modules/games/hooks/canvas-game.hook'
import { sfx } from '#/modules/games/utils/sfx'
import { hashSeed, mulberry32 } from '#/modules/games/utils/sudoku'
import { toFaDigits } from '#/modules/shell/utils/format'

const W = 360
const H = 540
const PADDLE_Y = 500
const PADDLE_H = 10
const R = 7
const COLS = 8
const GAP = 4
const BRICK_W = (W - 24 - GAP * (COLS - 1)) / COLS
const BRICK_H = 16

type Brick = { x: number; y: number; hp: number; row: number }

/** Seeded per level: same level, same layout. */
const buildBricks = (level: number): Brick[] => {
  const rand = mulberry32(hashSeed(`breakout:${level}`))
  const rows = Math.min(4 + level, 9)
  const bricks: Brick[] = []
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < COLS; col++) {
      if (level > 1 && rand() < 0.15) continue
      bricks.push({
        x: 12 + col * (BRICK_W + GAP),
        y: 60 + row * (BRICK_H + GAP),
        row,
        hp: rand() < Math.min(0.1 * level, 0.5) ? 2 : 1,
      })
    }
  return bricks
}

const newGame = () => ({
  paddle: W / 2,
  paddleW: 76,
  ball: { x: W / 2, y: PADDLE_Y - R - 1, vx: 0, vy: 0, stuck: true },
  bricks: buildBricks(1),
  level: 1,
  lives: 3,
  score: 0,
  sparks: [] as { x: number; y: number; vx: number; vy: number; life: number; hue: number }[],
})

const speedFor = (level: number) => Math.min(290 + level * 25, 500)

const BreakoutView = () => {
  const arcade = useArcade('breakout', {
    title: 'آجرشکن',
    detail: 'پارو را با انگشت یا کلیدهای جهت حرکت بده؛ لمس یا فاصله توپ را پرتاب می‌کند.',
  })
  const game = useRef(newGame())
  const held = useRef({ left: false, right: false })
  const playing = arcade.status === 'playing'

  const start = () => {
    game.current = newGame()
    arcade.begin()
  }

  const launch = () => {
    const b = game.current.ball
    if (!playing || !b.stuck) return
    const speed = speedFor(game.current.level)
    b.stuck = false
    b.vx = speed * 0.45
    b.vy = -speed * 0.89
  }

  const update = (dt: number) => {
    const g = game.current
    const b = g.ball
    const keyDir = Number(held.current.right) - Number(held.current.left)
    g.paddle = Math.min(Math.max(g.paddle + keyDir * 420 * dt, g.paddleW / 2), W - g.paddleW / 2)
    if (b.stuck) {
      b.x = g.paddle
      b.y = PADDLE_Y - R - 1
      return
    }
    const speed = Math.hypot(b.vx, b.vy)
    // Small sub-steps so a fast ball can't skip through a brick.
    const steps = Math.ceil((speed * dt) / 4)
    const h = dt / steps
    for (let s = 0; s < steps; s++) {
      for (const axis of ['x', 'y'] as const) {
        if (axis === 'x') b.x += b.vx * h
        else b.y += b.vy * h
        if (b.x < R || b.x > W - R) {
          b.x = Math.min(Math.max(b.x, R), W - R)
          b.vx = -b.vx
        }
        if (b.y < R) {
          b.y = R
          b.vy = Math.abs(b.vy)
        }
        const hit = g.bricks.find(
          (k) => k.hp > 0 && b.x + R > k.x && b.x - R < k.x + BRICK_W && b.y + R > k.y && b.y - R < k.y + BRICK_H,
        )
        if (!hit) continue
        if (axis === 'x') {
          b.x -= b.vx * h
          b.vx = -b.vx
        } else {
          b.y -= b.vy * h
          b.vy = -b.vy
        }
        hit.hp--
        if (hit.hp === 0) {
          g.score += 10 * (1 + Math.floor((8 - hit.row) / 3))
          arcade.setScore(g.score)
          for (let i = 0; i < 8; i++)
            g.sparks.push({
              x: hit.x + BRICK_W / 2,
              y: hit.y + BRICK_H / 2,
              vx: (Math.random() - 0.5) * 220,
              vy: (Math.random() - 0.5) * 220,
              life: 0.5,
              hue: hit.row * 35,
            })
          sfx.point()
        } else sfx.tap()
      }
      // Paddle: bounce angle follows where the ball lands on it.
      if (
        b.vy > 0 &&
        b.y + R >= PADDLE_Y &&
        b.y < PADDLE_Y + PADDLE_H &&
        Math.abs(b.x - g.paddle) < g.paddleW / 2 + R
      ) {
        const offset = Math.max(-1, Math.min(1, (b.x - g.paddle) / (g.paddleW / 2)))
        const angle = offset * (Math.PI / 3)
        b.vx = speed * Math.sin(angle)
        b.vy = -speed * Math.cos(angle)
        b.y = PADDLE_Y - R
        sfx.tap()
      }
      if (b.y > H + R) {
        g.lives--
        sfx.hit()
        b.stuck = true
        if (g.lives === 0) arcade.end(g.score)
        return
      }
    }
    if (g.bricks.every((k) => k.hp === 0)) {
      g.level++
      g.bricks = buildBricks(g.level)
      b.stuck = true
      sfx.win()
    }
  }

  const { canvasRef, toWorld } = useCanvasGame(W, H, (ctx, dt, pal) => {
    const g = game.current
    if (playing && g.lives > 0) update(dt)

    for (const k of g.bricks) {
      if (k.hp === 0) continue
      ctx.fillStyle = `hsl(${k.row * 35} 80% ${k.hp > 1 ? 42 : 60}%)`
      ctx.beginPath()
      ctx.roundRect(k.x, k.y, BRICK_W, BRICK_H, 4)
      ctx.fill()
    }
    g.sparks = g.sparks.filter((p) => (p.life -= dt) > 0)
    for (const p of g.sparks) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      ctx.globalAlpha = p.life * 2
      ctx.fillStyle = `hsl(${p.hue} 80% 60%)`
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = pal.fg
    ctx.beginPath()
    ctx.roundRect(g.paddle - g.paddleW / 2, PADDLE_Y, g.paddleW, PADDLE_H, 5)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(g.ball.x, g.ball.y, R, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = pal.muted
    ctx.font = '600 13px Vazirmatn Variable, system-ui'
    ctx.textAlign = 'right'
    ctx.fillText(`مرحله ${toFaDigits(g.level)}`, W - 12, 32)
    ctx.fillStyle = '#ef4444'
    for (let i = 0; i < g.lives; i++) {
      ctx.beginPath()
      ctx.arc(18 + i * 16, 27, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  const handleKey = (e: KeyboardEvent, down: boolean) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') held.current.left = down
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') held.current.right = down
    else if (e.code === 'Space' && down) launch()
    else return
    e.preventDefault()
  }
  useKeys(
    (e) => handleKey(e, true),
    (e) => handleKey(e, false),
  )

  const follow = (e: PointerEvent) => {
    const g = game.current
    g.paddle = Math.min(Math.max(toWorld(e).x, g.paddleW / 2), W - g.paddleW / 2)
  }

  return (
    <GameShell
      title="آجرشکن"
      stats={arcade.stats}
      overlay={arcade.overlay}
      onRestart={start}
      onPause={arcade.pause}
      scores={arcade.scores}
    >
      <GameCanvas
        ref={canvasRef}
        width={W}
        height={H}
        label="صفحهٔ آجرشکن"
        onPointerDown={(e) => {
          follow(e)
          launch()
        }}
        onPointerMove={follow}
      />
    </GameShell>
  )
}

export default BreakoutView
