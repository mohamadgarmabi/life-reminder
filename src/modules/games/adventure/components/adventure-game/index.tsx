import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from '@tanstack/react-router'
import { Canvas, useFrame } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Backpack, Pause } from 'lucide-react'
import { Button } from '#/components/button'
import type { AdventureWorld } from '#/modules/games/adventure/types'
import {
  createEngine,
  EngineContext,
  patchGame,
  updateSession,
  useEngine,
  useGame,
  useRuntimeRef,
  type Engine,
} from '#/modules/games/adventure/stores/session.store'
import { pause, saveNow } from '#/modules/games/adventure/stores/engine.actions'
import { useAdventureLifecycle } from '#/modules/games/adventure/hooks/lifecycle.hook'
import { nextTier, type TierState } from '#/modules/games/adventure/utils/quality'
import { Player } from '#/modules/games/adventure/components/player'
import { FollowCamera } from '#/modules/games/adventure/components/follow-camera'
import { InteractionPicker } from '#/modules/games/adventure/components/interactable'
import { TouchControls } from '#/modules/games/adventure/components/touch-controls'
import { LoadingScreen } from '#/modules/games/adventure/components/loading-screen'
import { MainMenu } from '#/modules/games/adventure/components/menus/main-menu'
import { PauseMenu } from '#/modules/games/adventure/components/menus/pause-menu'
import { Summary } from '#/modules/games/adventure/components/menus/summary'
import { ControlsHint } from '#/modules/games/adventure/components/menus/controls-hint'
import { InventoryDrawer, JournalReader } from '#/modules/games/adventure/components/menus/inventory'
import { Panel } from '#/modules/games/adventure/components/menus/panel'

const ENDING_SECONDS = 11
const HUD_BUTTON = 'size-11 rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/40'

type ReadyStep = 'data' | 'physics' | 'world'
type MarkReady = (step: ReadyStep) => void

/** Marks a loading step done once it has mounted (inside Suspense, so after its content resolved). */
const Ready = ({ step, mark }: { step: ReadyStep; mark: MarkReady }) => {
  useEffect(() => mark(step), [step, mark])
  return null
}

/** Unpaused play time, accumulated per frame (copied into the session on save). */
const PlayClock = () => {
  const runtimeRef = useRuntimeRef()
  const phase = useGame((g) => g.phase)
  useFrame((_, dt) => {
    if (phase === 'playing') runtimeRef.current.playTimeMs += Math.min(dt, 0.1) * 1000
  })
  return null
}

/** Auto quality: one FPS sample per second fed to nextTier. */
const QualityMonitor = () => {
  const { store } = useEngine()
  const mode = useGame((g) => g.settings.quality)
  const phase = useGame((g) => g.phase)
  const sample = useRef({ frames: 0, time: 0 })
  const state = useRef<TierState>({ tier: store.state.tier, slowFor: 0, fastFor: 0 })
  useEffect(() => {
    state.current = nextTier(state.current, 60, mode)
    if (mode !== 'auto') patchGame(store, { tier: mode })
  }, [mode, store])
  useFrame((_, dt) => {
    if (phase !== 'playing') return
    const s = sample.current
    s.frames += 1
    s.time += dt
    if (s.time < 1) return
    state.current = nextTier(state.current, s.frames / s.time, mode)
    s.frames = 0
    s.time = 0
    if (state.current.tier !== store.state.tier) patchGame(store, { tier: state.current.tier })
  })
  return null
}

/** Ends the ending sequence: marks the game completed, saves and shows the summary. */
const EndingTimer = () => {
  const engine = useEngine()
  const phase = useGame((g) => g.phase)
  const t = useRef(0)
  useFrame((_, dt) => {
    if (phase !== 'ending') {
      t.current = 0
      return
    }
    t.current += dt
    if (t.current < ENDING_SECONDS) return
    t.current = 0
    updateSession(engine.store, (s) => ({ ...s, completed: true, playTimeMs: Math.round(engine.runtime.playTimeMs) }))
    patchGame(engine.store, { phase: 'summary' })
  })
  return null
}

const Notice = () => {
  const { store } = useEngine()
  const notice = useGame((g) => g.notice)
  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => patchGame(store, { notice: null }), 3200)
    return () => window.clearTimeout(t)
  }, [notice, store])
  if (!notice) return null
  return (
    <p
      role="status"
      className="pointer-events-none absolute top-[calc(env(safe-area-inset-top)+4rem)] left-1/2 z-10 max-w-[85%] -translate-x-1/2 rounded-full bg-black/55 px-4 py-2 text-center text-sm text-white backdrop-blur animate-in fade-in slide-in-from-top-2"
    >
      {notice}
    </p>
  )
}

const Hud = () => {
  const engine = useEngine()
  const [inventory, setInventory] = useState(false)
  return (
    <div className="absolute top-[calc(env(safe-area-inset-top)+0.5rem)] right-[calc(env(safe-area-inset-right)+0.75rem)] left-[calc(env(safe-area-inset-left)+0.75rem)] z-10 flex justify-start gap-2">
      <Button size="icon" variant="ghost" className={HUD_BUTTON} onClick={() => pause(engine)} aria-label="مکث">
        <Pause />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className={HUD_BUTTON}
        onClick={() => setInventory(true)}
        aria-label="کوله‌پشتی"
      >
        <Backpack />
      </Button>
      <InventoryDrawer open={inventory} onOpenChange={setInventory} />
    </div>
  )
}

const Overlays = ({ progress }: { progress: number }) => {
  const { world } = useEngine()
  const phase = useGame((g) => g.phase)
  const reading = useGame((g) => g.reading)
  const hintSeen = useGame((g) => g.settings.hintSeen)
  return (
    <>
      {phase === 'loading' && <LoadingScreen title={world.title} progress={progress} />}
      {phase === 'menu' && <MainMenu />}
      {phase === 'playing' && (
        <>
          <TouchControls />
          <Hud />
          {!hintSeen && <ControlsHint />}
        </>
      )}
      {phase === 'paused' && !reading && <PauseMenu />}
      {phase === 'summary' && <Summary />}
      <JournalReader />
      <Notice />
    </>
  )
}

class GameErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (!this.state.failed) return this.props.children
    return <GameError message="مشکلی در اجرای بازی پیش آمد." onRetry={() => this.setState({ failed: false })} />
  }
}

const GameError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <Panel title="خطا">
    <p className="text-sm text-muted-foreground">{message} پیشرفت تا آخرین ذخیره محفوظ است.</p>
    <Button size="lg" className="h-12" onClick={onRetry}>
      تلاش دوباره
    </Button>
    <Button size="lg" variant="ghost" className="h-12" asChild>
      <Link to="/games">بازگشت به بازی‌ها</Link>
    </Button>
  </Panel>
)

const GameCanvas = ({ engine, mark }: { engine: Engine; mark: MarkReady }) => {
  const phase = useGame((g) => g.phase)
  const tier = useGame((g) => g.tier)
  const [contextLost, setContextLost] = useState(false)
  const running = phase === 'playing' || phase === 'ending'
  const { world } = engine

  if (contextLost)
    return (
      <GameError
        message="نمایشگر گرافیکی متوقف شد (احتمالاً به‌خاطر کمبود حافظه)."
        onRetry={() => window.location.reload()}
      />
    )

  return (
    <Canvas
      shadows
      dpr={tier === 'high' ? [1, 2] : 1}
      frameloop={running ? 'always' : 'demand'}
      camera={{ fov: 60, near: 0.1, far: 600, position: [0, 20, 40] }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          pause(engine)
          void saveNow(engine)
          setContextLost(true)
        })
      }}
    >
      <Suspense fallback={null}>
        <Physics paused={phase !== 'playing'}>
          <Ready step="physics" mark={mark} />
          <world.Scene />
          <Player killY={world.killY} />
          {/* Needs the physics world for its camera-collision ray. */}
          <FollowCamera />
          <Ready step="world" mark={mark} />
        </Physics>
      </Suspense>
      <InteractionPicker />
      <PlayClock />
      <QualityMonitor />
      <EndingTimer />
    </Canvas>
  )
}

/** Full-screen host for one adventure world: loading, menus, controls, saving and pause. */
const AdventureGame = ({ world }: { world: AdventureWorld }) => {
  const [engine] = useState(() => createEngine(world))
  const [ready, setReady] = useState<Record<ReadyStep, boolean>>({ data: false, physics: false, world: false })
  const [mark] = useState<MarkReady>(() => (step: ReadyStep) => setReady((r) => (r[step] ? r : { ...r, [step]: true })))
  useAdventureLifecycle(engine, mark)

  const done = Object.values(ready).filter(Boolean).length
  useEffect(() => {
    if (done === 3 && engine.store.state.phase === 'loading') patchGame(engine.store, { phase: 'menu' })
  }, [done, engine])

  return createPortal(
    <EngineContext.Provider value={engine}>
      <section
        className="fixed inset-0 z-50 overflow-hidden overscroll-none bg-sky-950 text-foreground select-none"
        style={{ touchAction: 'none' }}
        aria-label={world.title}
      >
        <GameErrorBoundary>
          <GameCanvas engine={engine} mark={mark} />
          <Overlays progress={(done / 3) * 100} />
        </GameErrorBoundary>
      </section>
    </EngineContext.Provider>,
    document.body,
  )
}

export { AdventureGame }
