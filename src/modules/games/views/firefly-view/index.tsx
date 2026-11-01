import { useRef } from 'react'
import { GameCanvas, GameShell } from '#/modules/games/components/game-shell'
import { useArcade } from '#/modules/games/hooks/arcade.hook'
import { useCanvasGame, useKeys } from '#/modules/games/hooks/canvas-game.hook'
import { sfx } from '#/modules/games/utils/sfx'

const W = 300
const H = 450
const GROUND = 420
const X = 80
const R = 11
const COL_W = 52
const SPACING = 185

type Column = { x: number; gapY: number; gap: number; passed: boolean }

const STARS = Array.from({ length: 40 }, (_, i) => ({ x: (i * 97) % W, y: (i * 53) % GROUND, s: (i % 3) + 1 }))

const newGame = () => ({ y: H / 2, vy: 0, cols: [] as Column[], next: 0, score: 0, alive: true, t: 0 })

const FireflyView = () => {
  const arcade = useArcade('firefly', {
    title: 'کرم شب‌تاب',
    detail: 'هر لمس (یا فاصله) یک بال‌زدن است. از لای ستون‌ها رد شو.',
  })
  const game = useRef(newGame())
  const playing = arcade.status === 'playing'

  const start = () => {
    game.current = newGame()
    arcade.begin()
  }

  const flap = () => {
    if (!playing || !game.current.alive) return
    game.current.vy = -360
    sfx.tap()
  }

  const die = () => {
    const g = game.current
    if (!g.alive) return
    g.alive = false
    sfx.hit()
    arcade.end(g.score)
  }

  const { canvasRef } = useCanvasGame(W, H, (ctx, dt, pal) => {
    const g = game.current
    g.t += dt
    const speed = Math.min(140 + g.score * 2.5, 230)
    if (playing && g.alive) {
      g.vy += 1250 * dt
      g.y += g.vy * dt
      g.next -= speed * dt
      if (g.next <= 0) {
        const gap = Math.max(112, 150 - g.score * 1.5)
        g.cols.push({ x: W, gap, gapY: 70 + gap / 2 + Math.random() * (GROUND - 140 - gap), passed: false })
        g.next = SPACING
      }
      for (const c of g.cols) {
        c.x -= speed * dt
        if (!c.passed && c.x + COL_W < X - R) {
          c.passed = true
          g.score++
          arcade.setScore(g.score)
          sfx.point()
        }
        const inX = X + R > c.x && X - R < c.x + COL_W
        if (inX && (g.y - R < c.gapY - c.gap / 2 || g.y + R > c.gapY + c.gap / 2)) die()
      }
      g.cols = g.cols.filter((c) => c.x > -COL_W)
      if (g.y + R > GROUND || g.y < -40) die()
    } else if (arcade.status === 'ready') g.y = H / 2 + Math.sin(g.t * 3) * 10

    ctx.fillStyle = pal.dark ? '#0b1026' : '#1e2a5a'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#ffffff'
    for (const s of STARS) {
      ctx.globalAlpha = 0.3 + 0.3 * Math.sin(g.t * 2 + s.x)
      ctx.fillRect((((s.x - g.t * 8 * s.s) % W) + W) % W, s.y, s.s, s.s)
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = '#14b8a6'
    for (const c of g.cols) {
      const top = c.gapY - c.gap / 2
      const bottom = c.gapY + c.gap / 2
      ctx.beginPath()
      ctx.roundRect(c.x, -10, COL_W, top + 10, 10)
      ctx.roundRect(c.x, bottom, COL_W, GROUND - bottom + 10, 10)
      ctx.fill()
    }
    ctx.fillStyle = '#0f766e'
    ctx.fillRect(0, GROUND, W, H - GROUND)

    const glow = ctx.createRadialGradient(X, g.y, 2, X, g.y, R * 3)
    glow.addColorStop(0, 'rgba(253, 224, 71, 0.9)')
    glow.addColorStop(1, 'rgba(253, 224, 71, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(X - R * 3, g.y - R * 3, R * 6, R * 6)
    ctx.fillStyle = '#fde047'
    ctx.beginPath()
    ctx.arc(X, g.y, R * 0.7, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    const wing = Math.sin(g.t * 30) * 4
    ctx.beginPath()
    ctx.ellipse(X - 4, g.y - 8, 7, 3 + wing * 0.5, -0.5, 0, Math.PI * 2)
    ctx.fill()
  })

  useKeys((e) => {
    if (e.code !== 'Space' && e.code !== 'ArrowUp') return
    e.preventDefault()
    flap()
  })

  return (
    <GameShell
      title="کرم شب‌تاب"
      stats={arcade.stats}
      overlay={arcade.overlay}
      onRestart={start}
      onPause={arcade.pause}
      scores={arcade.scores}
    >
      <GameCanvas ref={canvasRef} width={W} height={H} label="صفحهٔ کرم شب‌تاب" onPointerDown={flap} />
    </GameShell>
  )
}

export default FireflyView
