import { useRef, type PointerEvent } from 'react'
import { GameCanvas, GameShell } from '#/modules/games/components/game-shell'
import { useArcade } from '#/modules/games/hooks/arcade.hook'
import { useCanvasGame, useKeys } from '#/modules/games/hooks/canvas-game.hook'
import { sfx } from '#/modules/games/utils/sfx'

const W = 360
const H = 540
const SHIP_R = 12

type Rock = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hp: number
  rot: number
  vr: number
  shape: number[]
}
type Spark = { x: number; y: number; vx: number; vy: number; life: number }

const makeRock = (x: number, y: number, r: number, vx: number, vy: number): Rock => ({
  x,
  y,
  vx,
  vy,
  r,
  hp: Math.ceil(r / 12),
  rot: 0,
  vr: (Math.random() - 0.5) * 2,
  shape: Array.from({ length: 9 }, () => 0.75 + Math.random() * 0.35),
})

const STARS = Array.from({ length: 60 }, (_, i) => ({ x: (i * 131) % W, y: (i * 71) % H, s: (i % 3) + 1 }))

const newGame = () => ({
  ship: { x: W / 2, y: H - 70 },
  bullets: [] as { x: number; y: number; vx: number }[],
  rocks: [] as Rock[],
  stars: [] as { x: number; y: number }[],
  sparks: [] as Spark[],
  lives: 3,
  invuln: 0,
  power: 0,
  fire: 0,
  spawn: 0,
  time: 0,
  score: 0,
})

const MeteorView = () => {
  const arcade = useArcade('meteor', {
    title: 'باران شهاب',
    detail: 'انگشتت را روی صفحه بکش؛ سفینه خودکار شلیک می‌کند. ستاره‌ها شلیک سه‌تایی می‌دهند.',
  })
  const game = useRef(newGame())
  const held = useRef({ left: false, right: false, up: false, down: false })
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const playing = arcade.status === 'playing'

  const start = () => {
    game.current = newGame()
    arcade.begin()
  }

  const burst = (x: number, y: number, n: number) => {
    for (let i = 0; i < n; i++)
      game.current.sparks.push({ x, y, vx: (Math.random() - 0.5) * 260, vy: (Math.random() - 0.5) * 260, life: 0.6 })
  }

  const update = (dt: number) => {
    const g = game.current
    g.time += dt
    const k = held.current
    g.ship.x = Math.min(Math.max(g.ship.x + (Number(k.right) - Number(k.left)) * 300 * dt, SHIP_R), W - SHIP_R)
    g.ship.y = Math.min(Math.max(g.ship.y + (Number(k.down) - Number(k.up)) * 300 * dt, H / 2), H - SHIP_R - 8)
    g.invuln = Math.max(0, g.invuln - dt)
    g.power = Math.max(0, g.power - dt)

    g.fire -= dt
    if (g.fire <= 0) {
      g.fire = 0.16
      g.bullets.push({ x: g.ship.x, y: g.ship.y - SHIP_R, vx: 0 })
      if (g.power > 0)
        g.bullets.push({ x: g.ship.x, y: g.ship.y - SHIP_R, vx: -120 }, { x: g.ship.x, y: g.ship.y - SHIP_R, vx: 120 })
    }
    g.spawn -= dt
    if (g.spawn <= 0) {
      g.spawn = Math.max(0.32, 1.1 - g.time * 0.012)
      const r = 14 + Math.random() * 20
      g.rocks.push(
        makeRock(
          r + Math.random() * (W - 2 * r),
          -r,
          r,
          (Math.random() - 0.5) * 60,
          60 + Math.random() * 80 + g.time * 1.5,
        ),
      )
    }

    for (const b of g.bullets) {
      b.x += b.vx * dt
      b.y -= 620 * dt
    }
    for (const r of g.rocks) {
      r.x += r.vx * dt
      r.y += r.vy * dt
      r.rot += r.vr * dt
      if (r.x < r.r || r.x > W - r.r) r.vx = -r.vx
    }
    for (const s of g.stars) s.y += 90 * dt

    const born: Rock[] = []
    for (const b of g.bullets) {
      const hit = g.rocks.find((r) => r.hp > 0 && Math.hypot(r.x - b.x, r.y - b.y) < r.r)
      if (!hit) continue
      b.y = -100
      hit.hp--
      if (hit.hp > 0) continue
      g.score += Math.round(hit.r)
      arcade.setScore(g.score)
      burst(hit.x, hit.y, 10)
      sfx.point()
      if (hit.r > 22) for (const dir of [-1, 1]) born.push(makeRock(hit.x, hit.y, hit.r * 0.6, dir * 70, hit.vy * 0.9))
      if (Math.random() < 0.07) g.stars.push({ x: hit.x, y: hit.y })
    }

    const ship = g.ship
    g.stars = g.stars.filter((s) => {
      if (Math.hypot(s.x - ship.x, s.y - ship.y) < SHIP_R + 12) {
        g.power = 8
        sfx.win()
        return false
      }
      return s.y < H + 20
    })
    if (g.invuln === 0) {
      const crash = g.rocks.find((r) => r.hp > 0 && Math.hypot(r.x - ship.x, r.y - ship.y) < r.r + SHIP_R * 0.8)
      if (crash) {
        crash.hp = 0
        burst(ship.x, ship.y, 20)
        g.lives--
        g.invuln = 2
        sfx.hit()
        if (g.lives === 0) arcade.end(g.score)
      }
    }
    g.bullets = g.bullets.filter((b) => b.y > -10)
    g.rocks = [...g.rocks.filter((r) => r.hp > 0 && r.y < H + r.r), ...born]
  }

  const { canvasRef, toWorld } = useCanvasGame(W, H, (ctx, dt, pal) => {
    const g = game.current
    if (playing && g.lives > 0) update(dt)
    const t = performance.now() / 1000

    ctx.fillStyle = pal.dark ? '#05060f' : '#111633'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#fff'
    for (const s of STARS) {
      ctx.globalAlpha = 0.25 * s.s
      ctx.fillRect(s.x, (s.y + t * 20 * s.s) % H, s.s, s.s)
    }
    ctx.globalAlpha = 1

    ctx.fillStyle = '#a8a29e'
    ctx.strokeStyle = '#57534e'
    ctx.lineWidth = 2
    for (const r of g.rocks) {
      ctx.beginPath()
      r.shape.forEach((m, i) => {
        const a = r.rot + (i / r.shape.length) * Math.PI * 2
        const px = r.x + Math.cos(a) * r.r * m
        const py = r.y + Math.sin(a) * r.r * m
        if (i) ctx.lineTo(px, py)
        else ctx.moveTo(px, py)
      })
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }

    ctx.fillStyle = '#facc15'
    for (const s of g.stars) {
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        const rr = i % 2 ? 5 : 11
        ctx.lineTo(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr)
      }
      ctx.fill()
    }

    ctx.fillStyle = '#38bdf8'
    for (const b of g.bullets) ctx.fillRect(b.x - 1.5, b.y - 6, 3, 12)

    g.sparks = g.sparks.filter((p) => (p.life -= dt) > 0)
    ctx.fillStyle = '#fb923c'
    for (const p of g.sparks) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      ctx.globalAlpha = p.life / 0.6
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3)
    }
    ctx.globalAlpha = 1

    const { x, y } = g.ship
    if (g.lives > 0 && !(g.invuln > 0 && Math.floor(t * 10) % 2)) {
      ctx.fillStyle = '#f97316'
      ctx.beginPath()
      ctx.moveTo(x - 5, y + 10)
      ctx.lineTo(x, y + 18 + Math.sin(t * 40) * 4)
      ctx.lineTo(x + 5, y + 10)
      ctx.fill()
      ctx.fillStyle = g.power > 0 ? '#facc15' : '#e5e7eb'
      ctx.beginPath()
      ctx.moveTo(x, y - SHIP_R - 4)
      ctx.lineTo(x + SHIP_R, y + 10)
      ctx.lineTo(x, y + 5)
      ctx.lineTo(x - SHIP_R, y + 10)
      ctx.closePath()
      ctx.fill()
    }

    ctx.fillStyle = '#ef4444'
    for (let i = 0; i < g.lives; i++) {
      ctx.beginPath()
      ctx.arc(18 + i * 16, 20, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  const handleKey = (e: KeyboardEvent, down: boolean) => {
    const map: Record<string, keyof typeof held.current> = {
      ArrowLeft: 'left',
      KeyA: 'left',
      ArrowRight: 'right',
      KeyD: 'right',
      ArrowUp: 'up',
      KeyW: 'up',
      ArrowDown: 'down',
      KeyS: 'down',
    }
    const key = map[e.code]
    if (!key) return
    e.preventDefault()
    held.current[key] = down
  }
  useKeys(
    (e) => handleKey(e, true),
    (e) => handleKey(e, false),
  )

  // Relative drag: the ship keeps its offset from the finger, so the finger never hides it.
  const handlePointerDown = (e: PointerEvent) => {
    const p = toWorld(e)
    drag.current = { dx: game.current.ship.x - p.x, dy: game.current.ship.y - p.y }
  }
  const handlePointerMove = (e: PointerEvent) => {
    if (!drag.current) return
    const p = toWorld(e)
    const ship = game.current.ship
    ship.x = Math.min(Math.max(p.x + drag.current.dx, SHIP_R), W - SHIP_R)
    ship.y = Math.min(Math.max(p.y + drag.current.dy, H / 2), H - SHIP_R - 8)
  }

  return (
    <GameShell
      title="باران شهاب"
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
        label="صفحهٔ باران شهاب"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      />
    </GameShell>
  )
}

export default MeteorView
