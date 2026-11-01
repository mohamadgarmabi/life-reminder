import { useRef, type PointerEvent, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
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

type SceneProps = { game: RefObject<Runner>; dark: boolean; onStep: (dt: number) => void }

const Scene = ({ game, dark, onStep }: SceneProps) => {
  const player = useRef<THREE.Mesh>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const slots = useRef<(THREE.Mesh | null)[]>([])
  const dashes = useRef<(THREE.Mesh | null)[]>([])
  const trees = useRef<(THREE.Group | null)[]>([])
  const sky = dark ? '#0b1026' : '#bfe3ff'

  useFrame((state, delta) => {
    // Clamped so a dropped frame or a background tab can't skip the player through a block.
    onStep(Math.min(delta, 1 / 30))
    const r = game.current
    const t = state.clock.elapsedTime

    if (player.current) {
      player.current.position.set(r.x, 0.75 + r.y + (r.y === 0 && r.alive ? Math.abs(Math.sin(t * 12)) * 0.08 : 0), 0)
      player.current.rotation.z = (LANES[r.lane] - r.x) * -0.25
      player.current.rotation.x = r.alive ? 0 : -1.2
    }
    if (shadow.current) {
      shadow.current.position.x = r.x
      shadow.current.scale.setScalar(1 / (1 + r.y * 0.6))
    }
    r.things.forEach((thing, i) => {
      const mesh = slots.current[i]
      if (!mesh) return
      mesh.visible = thing.active
      if (!thing.active) return
      mesh.geometry = GEOMETRY[thing.kind]
      mesh.material = MATERIAL[thing.kind]
      mesh.position.set(LANES[thing.lane], Y[thing.kind], thing.z)
      mesh.rotation.y = thing.kind === 'orb' ? t * 3 : 0
    })
    // Lane dashes and roadside trees loop with the distance travelled, which sells the speed.
    dashes.current.forEach((mesh, i) => {
      if (mesh) mesh.position.z = SPAWN_Z + ((Math.floor(i / 2) * DASH_GAP + r.distance) % (DASHES * DASH_GAP))
    })
    trees.current.forEach((tree, i) => {
      if (tree)
        tree.position.z =
          SPAWN_Z + ((Math.floor(i / 2) * TREE_GAP * 2 + (i % 2) * TREE_GAP + r.distance) % (TREES * TREE_GAP))
    })

    state.camera.position.set(r.x * 0.5, 3.4, 6.5)
    state.camera.lookAt(r.x * 0.4, 0.9, -8)
  })

  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 30, 95]} />
      <hemisphereLight args={[dark ? '#7c8cff' : '#ffffff', dark ? '#1e293b' : '#86efac', dark ? 0.9 : 1.4]} />
      <directionalLight position={[4, 10, 6]} intensity={dark ? 1 : 1.6} />

      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -40]}>
        <planeGeometry args={[6.6, 120]} />
        <meshStandardMaterial color={dark ? '#334155' : '#64748b'} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -40]}>
        <planeGeometry args={[60, 120]} />
        <meshStandardMaterial color={dark ? '#14532d' : '#4ade80'} />
      </mesh>
      {Array.from({ length: DASHES * 2 }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => void (dashes.current[i] = m)}
          rotation-x={-Math.PI / 2}
          position={[i % 2 ? 1 : -1, 0.01, 0]}
        >
          <planeGeometry args={[0.12, 1.6]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}
      {Array.from({ length: TREES * 2 }, (_, i) => (
        <group key={i} ref={(g) => void (trees.current[i] = g)} position={[(i % 2 ? 1 : -1) * (5 + (i % 3)), 0, 0]}>
          <mesh position-y={0.5}>
            <cylinderGeometry args={[0.15, 0.2, 1, 6]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
          <mesh position-y={1.7}>
            <coneGeometry args={[0.9, 2, 7]} />
            <meshStandardMaterial color={dark ? '#166534' : '#16a34a'} flatShading />
          </mesh>
        </group>
      ))}

      {Array.from({ length: POOL }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => void (slots.current[i] = m)}
          visible={false}
          geometry={GEOMETRY.low}
          material={MATERIAL.low}
        />
      ))}

      <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>
      <mesh ref={player}>
        <capsuleGeometry args={[0.38, 0.7, 6, 16]} />
        <meshStandardMaterial color="#6366f1" roughness={0.35} />
      </mesh>
    </>
  )
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
        <Canvas
          dpr={[1, 2]}
          frameloop={playing ? 'always' : 'demand'}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ fov: 60, position: [0, 3.4, 6.5], near: 0.1, far: 120 }}
        >
          <Scene game={game} dark={dark} onStep={step} />
        </Canvas>
      </div>
    </GameShell>
  )
}

export default RunnerView
