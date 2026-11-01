import { useEffect, useRef, type PointerEvent, type RefObject } from 'react'
import * as THREE from 'three'
import { GameShell } from '#/modules/games/components/game-shell'
import { useArcade } from '#/modules/games/hooks/arcade.hook'
import { useKeys } from '#/modules/games/hooks/canvas-game.hook'
import {
  LANES,
  POOL,
  SPAWN_Z,
  createRunner,
  jump,
  moveLane,
  runnerScore,
  stepRunner,
  type Runner,
  type ThingKind,
} from '#/modules/games/utils/runner'
import { sfx } from '#/modules/games/utils/sfx'

// Shared geometry/materials: one GPU upload for the whole pool, swapped per slot by kind.
const GEOMETRY: Record<ThingKind, THREE.BufferGeometry> = {
  low: new THREE.BoxGeometry(1.7, 0.8, 0.5),
  high: new THREE.BoxGeometry(1.7, 2.6, 0.9),
  orb: new THREE.IcosahedronGeometry(0.38, 0),
}
const MATERIAL: Record<ThingKind, THREE.Material> = {
  low: new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.5 }),
  high: new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 }),
  orb: new THREE.MeshStandardMaterial({
    color: '#facc15',
    emissive: '#facc15',
    emissiveIntensity: 0.8,
    flatShading: true,
  }),
}
const Y: Record<ThingKind, number> = { low: 0.4, high: 1.3, orb: 1 }

const DASH_GAP = 4
const DASHES = 24
const TREES = 16
const TREE_GAP = 6

type SceneProps = { game: RefObject<Runner>; dark: boolean; playing: boolean; onStep: (dt: number) => void }

const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material) => new THREE.Mesh(geometry, material)

// Plain three.js, not React Three Fiber: the app runs on @tanstack/redact, which has no react-reconciler.
const Scene = ({ game, dark, playing, onStep }: SceneProps) => {
  const host = useRef<HTMLDivElement>(null)
  const loop = useRef<{ play: (on: boolean) => void } | null>(null)
  const step = useRef(onStep)
  useEffect(() => {
    step.current = onStep
  })

  useEffect(() => {
    const el = host.current
    if (!el) return
    const sky = dark ? '#0b1026' : '#bfe3ff'
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(sky)
    scene.fog = new THREE.Fog(sky, 30, 95)
    scene.add(new THREE.HemisphereLight(dark ? '#7c8cff' : '#ffffff', dark ? '#1e293b' : '#86efac', dark ? 0.9 : 1.4))
    const sun = new THREE.DirectionalLight('#ffffff', dark ? 1 : 1.6)
    sun.position.set(4, 10, 6)
    scene.add(sun)

    const road = mesh(
      new THREE.PlaneGeometry(6.6, 120),
      new THREE.MeshStandardMaterial({ color: dark ? '#334155' : '#64748b' }),
    )
    road.rotation.x = -Math.PI / 2
    road.position.set(0, 0, -40)
    const grass = mesh(
      new THREE.PlaneGeometry(60, 120),
      new THREE.MeshStandardMaterial({ color: dark ? '#14532d' : '#4ade80' }),
    )
    grass.rotation.x = -Math.PI / 2
    grass.position.set(0, -0.01, -40)
    scene.add(road, grass)

    const dashGeometry = new THREE.PlaneGeometry(0.12, 1.6)
    const dashMaterial = new THREE.MeshBasicMaterial({ color: '#f8fafc' })
    const dashes = Array.from({ length: DASHES * 2 }, (_, i) => {
      const dash = mesh(dashGeometry, dashMaterial)
      dash.rotation.x = -Math.PI / 2
      dash.position.set(i % 2 ? 1 : -1, 0.01, 0)
      scene.add(dash)
      return dash
    })

    const trunk = new THREE.CylinderGeometry(0.15, 0.2, 1, 6)
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#92400e' })
    const crown = new THREE.ConeGeometry(0.9, 2, 7)
    const crownMaterial = new THREE.MeshStandardMaterial({ color: dark ? '#166534' : '#16a34a', flatShading: true })
    const trees = Array.from({ length: TREES * 2 }, (_, i) => {
      const tree = new THREE.Group()
      const t = mesh(trunk, trunkMaterial)
      t.position.y = 0.5
      const c = mesh(crown, crownMaterial)
      c.position.y = 1.7
      tree.add(t, c)
      tree.position.x = (i % 2 ? 1 : -1) * (5 + (i % 3))
      scene.add(tree)
      return tree
    })

    const slots = Array.from({ length: POOL }, () => {
      const slot = mesh(GEOMETRY.low, MATERIAL.low)
      slot.visible = false
      scene.add(slot)
      return slot
    })

    const shadow = mesh(
      new THREE.CircleGeometry(0.5, 24),
      new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.25 }),
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = 0.02
    const player = mesh(
      new THREE.CapsuleGeometry(0.38, 0.7, 6, 16),
      new THREE.MeshStandardMaterial({ color: '#6366f1', roughness: 0.35 }),
    )
    scene.add(shadow, player)

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120)
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.style.display = 'block'
    el.appendChild(renderer.domElement)

    const timer = new THREE.Timer()
    const draw = (dt: number) => {
      const r = game.current
      const t = timer.getElapsed()
      player.position.set(r.x, 0.75 + r.y + (r.y === 0 && r.alive ? Math.abs(Math.sin(t * 12)) * 0.08 : 0), 0)
      player.rotation.z = (LANES[r.lane] - r.x) * -0.25
      player.rotation.x = r.alive ? 0 : -1.2
      shadow.position.x = r.x
      shadow.scale.setScalar(1 / (1 + r.y * 0.6))
      r.things.forEach((thing, i) => {
        const slot = slots[i]
        slot.visible = thing.active
        if (!thing.active) return
        slot.geometry = GEOMETRY[thing.kind]
        slot.material = MATERIAL[thing.kind]
        slot.position.set(LANES[thing.lane], Y[thing.kind], thing.z)
        slot.rotation.y = thing.kind === 'orb' ? t * 3 : 0
      })
      // Lane dashes and roadside trees loop with the distance travelled, which sells the speed.
      dashes.forEach((dash, i) => {
        dash.position.z = SPAWN_Z + ((Math.floor(i / 2) * DASH_GAP + r.distance) % (DASHES * DASH_GAP))
      })
      trees.forEach((tree, i) => {
        tree.position.z =
          SPAWN_Z + ((Math.floor(i / 2) * TREE_GAP * 2 + (i % 2) * TREE_GAP + r.distance) % (TREES * TREE_GAP))
      })
      camera.position.set(r.x * 0.5, 3.4, 6.5)
      camera.lookAt(r.x * 0.4, 0.9, -8)
      if (dt) step.current(dt)
      renderer.render(scene, camera)
    }
    const tick = (time: number) => {
      timer.update(time)
      // Clamped so a dropped frame or a background tab can't skip the player through a block.
      draw(Math.min(timer.getDelta(), 1 / 30))
    }

    const resize = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      draw(0)
    })
    resize.observe(el)
    loop.current = {
      play: (on) => {
        timer.reset()
        renderer.setAnimationLoop(on ? tick : null)
        if (!on) draw(0)
      },
    }

    return () => {
      loop.current = null
      resize.disconnect()
      renderer.setAnimationLoop(null)
      renderer.dispose()
      renderer.domElement.remove()
      // Shared GEOMETRY/MATERIAL stay alive for the next run; everything built here is freed.
      scene.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return
        if (!Object.values(GEOMETRY).includes(o.geometry)) o.geometry.dispose()
        if (!Object.values(MATERIAL).includes(o.material)) (o.material as THREE.Material).dispose()
      })
    }
  }, [dark, game])

  useEffect(() => {
    loop.current?.play(playing)
  }, [playing, dark])

  return <div ref={host} className="size-full" />
}

const RunnerView = () => {
  const arcade = useArcade('runner', {
    title: 'دوندهٔ سه‌بعدی',
    detail: 'به چپ و راست بکش تا مسیر عوض شود، رو به بالا بکش یا ضربه بزن تا بپری. از مانع قرمز فقط کنار برو.',
  })
  const game = useRef(createRunner())
  const scoreClock = useRef(0)
  const swipe = useRef<{ x: number; y: number; done: boolean } | null>(null)
  const playing = arcade.status === 'playing'
  const dark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  const start = () => {
    game.current = createRunner()
    scoreClock.current = 0
    arcade.begin()
  }

  const step = (dt: number) => {
    const r = game.current
    if (!playing || !r.alive) return
    const { orb, crash } = stepRunner(r, dt)
    if (orb) sfx.point()
    // React score updates are throttled; the 3D scene itself never re-renders per frame.
    scoreClock.current += dt
    if (scoreClock.current > 0.25) {
      scoreClock.current = 0
      arcade.setScore(runnerScore(r))
    }
    if (crash) {
      sfx.hit()
      arcade.end(runnerScore(r))
    }
  }

  const act = (action: 'left' | 'right' | 'jump') => {
    if (!playing) return
    if (action === 'jump') {
      if (game.current.y === 0) sfx.tap()
      jump(game.current)
    } else moveLane(game.current, action === 'left' ? -1 : 1)
  }

  useKeys((e) => {
    const map: Record<string, 'left' | 'right' | 'jump'> = {
      ArrowLeft: 'left',
      KeyA: 'left',
      ArrowRight: 'right',
      KeyD: 'right',
      ArrowUp: 'jump',
      KeyW: 'jump',
      Space: 'jump',
    }
    const action = map[e.code]
    if (!action) return
    e.preventDefault()
    act(action)
  })

  // One gesture = one action: a short swipe changes lane or jumps, a tap jumps.
  const handlePointerMove = (e: PointerEvent) => {
    const s = swipe.current
    if (!s || s.done) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    s.done = true
    act(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : 'jump')
  }
  const handlePointerUp = () => {
    if (swipe.current && !swipe.current.done) act('jump')
    swipe.current = null
  }

  return (
    <GameShell
      title="دوندهٔ سه‌بعدی"
      stats={arcade.stats}
      overlay={arcade.overlay}
      onRestart={start}
      onPause={arcade.pause}
      scores={arcade.scores}
    >
      <div
        className="h-[calc(100cqh-1.5rem)] w-full touch-none overflow-hidden rounded-3xl shadow-[0_0_0_0.5px_var(--border)]"
        role="img"
        aria-label="صحنهٔ سه‌بعدی دونده"
        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY, done: false })}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => (swipe.current = null)}
      >
        <Scene game={game} dark={dark} playing={playing} onStep={step} />
      </div>
    </GameShell>
  )
}

export default RunnerView
