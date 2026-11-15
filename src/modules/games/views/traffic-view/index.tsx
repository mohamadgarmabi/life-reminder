import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Armchair, Car, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '#/components/button'
import { Progress } from '#/components/progress'
import { toast } from '#/components/sonner'
import { GameShell } from '#/modules/games/components/game-shell'
import { useArcade } from '#/modules/games/hooks/arcade.hook'
import { useKeys } from '#/modules/games/hooks/canvas-game.hook'
import type { GameOverlay } from '#/modules/games/types'
import { loadGameData, saveGameData } from '#/modules/games/utils/game-db'
import { createTraffic, populate, stepTraffic, trafficScore, type DriveInput } from '#/modules/games/utils/traffic'
import { createEngine, sfx } from '#/modules/games/utils/sfx'
import { createTrafficScene, type TrafficScene } from '#/modules/games/views/traffic-view/scene'
import { DEFAULT_SETUP, TrafficSetup, setupSchema, type Setup } from '#/modules/games/views/traffic-view/setup'
import { cn } from '#/modules/shell/utils/cn'
import { toFaDigits } from '#/modules/shell/utils/format'

const SETUP_KEY = 'traffic:setup'
const STEER_KEYS: Record<string, -1 | 1> = { ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1 }
const BRAKE_KEYS = new Set(['ArrowDown', 'KeyS', 'Space'])
/** Pointer-id slot for the brake pedal in the touches map (real pointer ids are never negative). */
const BRAKE_ID = -1
/** Degrees of tilt for full steering lock, and the dead zone around "straight". */
const TILT_FULL = 22
const TILT_DEADZONE = 2.5

type Load = { progress: number; ready: boolean; error: string | null }
type OrientationPermission = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

/** iOS asks for motion access (from a tap); other browsers just deliver events. */
const requestTilt = async () => {
  const D = DeviceOrientationEvent as OrientationPermission
  if (typeof D.requestPermission !== 'function') return true
  try {
    return (await D.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

/** Left/right tilt in degrees for the current screen orientation (positive = right side down). */
const tiltAngle = (e: DeviceOrientationEvent) => {
  const angle = screen.orientation?.angle ?? 0
  if (angle === 90) return e.beta ?? 0
  if (angle === 270 || angle === -90) return -(e.beta ?? 0)
  return e.gamma ?? 0
}

const TrafficView = () => {
  const arcade = useArcade('traffic', { title: 'ترافیک', detail: '' })
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<TrafficScene | null>(null)
  const game = useRef(createTraffic())
  const input = useRef<DriveInput>({ steer: 0, brake: false })
  const touches = useRef(new Map<number, -1 | 1>())
  const keys = useRef(new Set<string>())
  const tilt = useRef<{ neutral: number | null; steer: number; seen: boolean }>({
    neutral: null,
    steer: 0,
    seen: false,
  })
  const tiltDot = useRef<HTMLSpanElement>(null)
  const engine = useRef<ReturnType<typeof createEngine> | null>(null)
  const hudClock = useRef(0)
  const [setup, setSetup] = useState<Setup>(DEFAULT_SETUP)
  /** The settings of the run in progress; null while on the setup screen. */
  const [run, setRun] = useState<Setup | null>(null)
  const [load, setLoad] = useState<Load>({ progress: 0, ready: false, error: null })
  const [attempt, setAttempt] = useState(0)
  const [hud, setHud] = useState({ kmh: 0, steer: 0 as -1 | 0 | 1, braking: false })
  const [nearMiss, setNearMiss] = useState(0)
  const playing = arcade.status === 'playing'

  useEffect(() => {
    void loadGameData(SETUP_KEY, setupSchema).then((saved) => saved && setSetup(saved))
  }, [])

  const syncInput = () => {
    let steer = run?.control === 'tilt' ? tilt.current.steer : 0
    for (const [id, side] of touches.current) if (id !== BRAKE_ID) steer += side
    for (const k of keys.current) steer += STEER_KEYS[k] ?? 0
    input.current = {
      steer: Math.max(-1, Math.min(1, steer)),
      brake: touches.current.has(BRAKE_ID) || [...keys.current].some((k) => BRAKE_KEYS.has(k)),
    }
  }

  // Latest step for the render loop, which is created once per scene.
  const stepRef = useRef<(dt: number) => void>(() => {})
  const startRef = useRef(() => {})
  const step = (dt: number) => {
    const t = game.current
    if (!playing || !t.alive) return
    const events = stepTraffic(t, input.current, dt)
    engine.current?.set(t.speed / 75, true)
    if (events.pass) sfx.point()
    if (events.nearMiss) setNearMiss((n) => n + 1)
    hudClock.current += dt
    if (hudClock.current > 0.15) {
      hudClock.current = 0
      arcade.setScore(trafficScore(t))
      setHud({
        kmh: Math.round(t.speed * 3.6),
        steer: Math.sign(input.current.steer) as -1 | 0 | 1,
        braking: input.current.brake,
      })
    }
    if (events.crash) {
      sfx.hit()
      engine.current?.set(0, false)
      arcade.end(trafficScore(t))
    }
  }
  const start = () => {
    if (!run) return
    game.current = createTraffic({ vehicle: run.vehicle, difficulty: run.difficulty, weather: run.weather })
    populate(game.current)
    touches.current.clear()
    keys.current.clear()
    // The angle the phone is held at when the run starts counts as "straight".
    tilt.current = { neutral: null, steer: 0, seen: tilt.current.seen }
    syncInput()
    hudClock.current = 0
    setNearMiss(0)
    arcade.begin()
  }

  useEffect(() => {
    stepRef.current = step
    startRef.current = start
  })

  // Build the 3D world for the chosen car, time and weather.
  useEffect(() => {
    const el = host.current
    if (!run || !el) return
    let cancelled = false
    let built: TrafficScene | null = null
    setLoad({ progress: 0, ready: false, error: null })
    createTrafficScene(
      el,
      () => game.current,
      (dt) => stepRef.current(dt),
      {
        night: run.night,
        weather: run.weather,
        vehicle: run.vehicle,
        paint: run.paint,
        touch: matchMedia('(pointer: coarse)').matches,
        onProgress: (progress) => !cancelled && setLoad((l) => ({ ...l, progress })),
        onContextLost: () =>
          setLoad({ progress: 0, ready: false, error: 'نمایشگر گرافیکی متوقف شد (احتمالاً کمبود حافظه).' }),
      },
    )
      .then((s) => {
        built = s
        if (cancelled) s.dispose()
        else {
          scene.current = s
          setLoad({ progress: 1, ready: true, error: null })
          // Start driving as soon as the world is ready.
          startRef.current()
        }
      })
      .catch(
        () =>
          !cancelled &&
          setLoad({ progress: 0, ready: false, error: 'بارگیری بازی ناموفق بود. اتصال اینترنت را بررسی کن.' }),
      )
    return () => {
      cancelled = true
      scene.current = null
      built?.dispose()
    }
  }, [run, attempt])

  useEffect(() => {
    scene.current?.setPlaying(playing)
    if (!playing) engine.current?.set(0, false)
  }, [playing, load.ready])

  useEffect(() => () => engine.current?.stop(), [])

  // Camera view can change mid-run without rebuilding the world.
  useEffect(() => {
    scene.current?.setView(setup.view)
  }, [setup.view, load.ready])

  const toggleView = () => {
    const next = { ...setup, view: setup.view === 'chase' ? ('cockpit' as const) : ('chase' as const) }
    setSetup(next)
    void saveGameData(SETUP_KEY, next)
  }

  // Tilt steering: phone orientation → steering, with a fallback to buttons if the sensor stays silent.
  useEffect(() => {
    if (run?.control !== 'tilt' || !load.ready) return
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma === null && e.beta === null) return
      const t = tilt.current
      t.seen = true
      const a = tiltAngle(e)
      t.neutral ??= a
      const d = a - t.neutral
      const mag = Math.max(0, Math.abs(d) - TILT_DEADZONE) / (TILT_FULL - TILT_DEADZONE)
      t.steer = Math.sign(d) * Math.min(1, mag)
      if (tiltDot.current) tiltDot.current.style.transform = `translateX(${t.steer * 100}%)`
      syncInput()
    }
    window.addEventListener('deviceorientation', onTilt)
    const silent = window.setTimeout(() => {
      if (tilt.current.seen) return
      toast.info('حسگر حرکت پاسخ نداد؛ فرمان به دکمه‌های چپ و راست تغییر کرد.')
      const next = { ...run, control: 'touch' as const }
      setSetup(next)
      setRun(next)
      void saveGameData(SETUP_KEY, next)
    }, 2000)
    return () => {
      window.removeEventListener('deviceorientation', onTilt)
      window.clearTimeout(silent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- syncInput only reads refs
  }, [run, load.ready])

  useKeys(
    (e) => {
      if (e.code === 'KeyC' && !e.repeat && run) return toggleView()
      if (!(e.code in STEER_KEYS) && !BRAKE_KEYS.has(e.code)) return
      e.preventDefault()
      keys.current.add(e.code)
      syncInput()
    },
    (e) => {
      keys.current.delete(e.code)
      syncInput()
    },
  )

  const handleSetupStart = async () => {
    // Both need the tap itself: audio may only start, and iOS only asks for motion access, from a user gesture.
    engine.current ??= createEngine()
    let next = setup
    if (next.control === 'tilt' && !(await requestTilt())) {
      toast.info('اجازهٔ حسگر حرکت داده نشد؛ با دکمه‌های چپ و راست بازی کن.')
      next = { ...next, control: 'touch' }
    }
    setSetup(next)
    void saveGameData(SETUP_KEY, next)
    setRun(next)
  }

  const toSetup = () => {
    setRun(null)
    setLoad({ progress: 0, ready: false, error: null })
  }

  // Hold a half of the screen to steer that way (physical sides, not mirrored for RTL).
  const handleDown = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    touches.current.set(e.pointerId, e.clientX - rect.left < rect.width / 2 ? -1 : 1)
    e.currentTarget.setPointerCapture(e.pointerId)
    syncInput()
  }
  const handleUp = (e: PointerEvent<HTMLDivElement>) => {
    touches.current.delete(e.pointerId)
    syncInput()
  }
  // Brake pedal: tracked as a pseudo-touch so releasing it anywhere clears it.
  const handleBrake = (e: PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (e.type === 'pointerdown') touches.current.set(BRAKE_ID, 1)
    else touches.current.delete(BRAKE_ID)
    syncInput()
  }

  const overlay: GameOverlay | null =
    !run || !load.ready || !arcade.overlay || arcade.status === 'ready'
      ? null
      : arcade.status === 'over'
        ? {
            ...arcade.overlay,
            action: 'دوباره',
            onAction: start,
            secondary: { label: 'تغییر ماشین و تنظیمات', onAction: toSetup },
          }
        : arcade.overlay
  const showHud = !!run && load.ready && arcade.status !== 'ready'
  const touchControls = run?.control !== 'tilt'

  return (
    <GameShell
      title="ترافیک"
      immersive
      overlay={overlay}
      onRestart={start}
      onPause={run ? arcade.pause : undefined}
      actions={
        showHud && (
          <Button
            variant="secondary"
            size="icon"
            className="size-11 bg-secondary/80 hover:bg-secondary [&_svg:not([class*=size-])]:size-5"
            onClick={toggleView}
            aria-label={setup.view === 'chase' ? 'نمای داخل ماشین' : 'نمای پشت ماشین'}
          >
            {setup.view === 'chase' ? <Armchair /> : <Car />}
          </Button>
        )
      }
      scores={arcade.scores}
    >
      <div className="relative size-full touch-none bg-black select-none">
        <div ref={host} className="absolute inset-0" role="img" aria-label="صحنهٔ سه‌بعدی بزرگراه" />

        {!run && <TrafficSetup value={setup} onChange={setSetup} onStart={() => void handleSetupStart()} />}

        {run && !load.ready && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/70 p-8 text-center text-white">
            {load.error ? (
              <>
                <p className="text-sm">{load.error}</p>
                <Button onClick={() => setAttempt((a) => a + 1)}>تلاش دوباره</Button>
                <Button variant="ghost" className="text-white" onClick={toSetup}>
                  بازگشت به تنظیمات
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-bold">در حال آماده‌سازی جاده…</p>
                <Progress value={load.progress * 100} className="w-56" />
                <p className="text-xs text-white/70">
                  بار اول حدود ۱۲ مگابایت بارگیری می‌شود؛ بعد از آن آفلاین هم کار می‌کند.
                </p>
              </>
            )}
          </div>
        )}

        {showHud && (
          <>
            {touchControls && (
              // Steering zones cover the whole screen under the HUD.
              <div
                className="absolute inset-0"
                onPointerDown={handleDown}
                onPointerUp={handleUp}
                onPointerCancel={handleUp}
                aria-hidden
              />
            )}
            <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+4rem)] flex flex-col items-center gap-1 text-white drop-shadow-[0_1px_3px_rgb(0_0_0/0.7)]">
              <p className="text-sm font-semibold tabular-nums">
                امتیاز {arcade.stats[0].value} · بهترین {arcade.stats[1].value}
              </p>
              {nearMiss > 0 && (
                <p
                  key={nearMiss}
                  className="text-lg font-bold text-amber-300 animate-out fade-out fill-mode-forwards duration-1000"
                >
                  سبقت مرزی! +۲۵
                </p>
              )}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+7.5rem)] text-center text-white drop-shadow-[0_2px_4px_rgb(0_0_0/0.8)]">
              <p className="text-5xl leading-none font-black tabular-nums">{toFaDigits(hud.kmh)}</p>
              <p className="text-xs font-semibold tracking-widest">km/h</p>
            </div>
            {touchControls ? (
              ([-1, 1] as const).map((side) => (
                <span
                  key={side}
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] grid size-16 place-items-center rounded-full bg-black/25 text-white/80 backdrop-blur-sm transition',
                    side < 0
                      ? 'left-[calc(env(safe-area-inset-left)+1.25rem)]'
                      : 'right-[calc(env(safe-area-inset-right)+1.25rem)]',
                    hud.steer === side && 'scale-110 bg-white/40 text-white',
                  )}
                >
                  {side < 0 ? <ChevronLeft className="size-8" /> : <ChevronRight className="size-8" />}
                </span>
              ))
            ) : (
              // Tilt gauge: where "straight" is and how far the phone is turned.
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-[calc(50%-7rem)] bottom-[calc(env(safe-area-inset-bottom)+6.25rem)] h-2 rounded-full bg-white/25"
              >
                <span className="absolute top-1/2 left-1/2 h-4 w-0.5 -translate-1/2 bg-white/60" />
                <span className="absolute top-1/2 left-[calc(50%-0.5rem)] block w-28">
                  <span
                    ref={tiltDot}
                    className="block size-4 -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-75"
                  />
                </span>
              </div>
            )}
            <button
              type="button"
              aria-label="ترمز"
              onPointerDown={handleBrake}
              onPointerUp={handleBrake}
              onPointerCancel={handleBrake}
              onPointerLeave={handleBrake}
              className={cn(
                'absolute bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] left-1/2 h-20 w-24 -translate-x-1/2 rounded-2xl border-2 border-white/40 bg-black/35 text-sm font-bold text-white backdrop-blur-sm transition',
                hud.braking && 'scale-95 border-red-400 bg-red-600/60',
              )}
            >
              ترمز
            </button>
          </>
        )}
      </div>
    </GameShell>
  )
}

export default TrafficView
