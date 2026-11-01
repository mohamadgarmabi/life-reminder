import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Maximize, Minimize, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { z } from 'zod'
import type { GameOverlay, ScoreEntry } from '#/modules/games/types'
import { loadGameData, saveGameData } from '#/modules/games/utils/game-db'
import { setMuted } from '#/modules/games/utils/sfx'
import { toFaDigits } from '#/modules/shell/utils/format'
import { Button } from '#/components/button'

type GameShellProps = {
  title: string
  stats?: { label: string; value: ReactNode }[]
  overlay?: GameOverlay | null
  /** Starts a new run; used by the overlay when it has no onAction of its own, and by "restart". */
  onRestart?: () => void
  /** Shown as a pause button while the game is running. */
  onPause?: () => void
  /** Local leaderboard shown on the overlay. */
  scores?: ScoreEntry[]
  formatScore?: (score: number) => string
  /** Extra HUD buttons (e.g. level picker). */
  actions?: ReactNode
  before?: ReactNode
  after?: ReactNode
  children: ReactNode
}

const HUD_BUTTON = 'size-11 bg-secondary/80 hover:bg-secondary [&_svg:not([class*=size-])]:size-5'

const SoundToggle = () => {
  const [muted, setMutedState] = useState(false)
  useEffect(() => {
    void loadGameData('sfx:muted', z.boolean()).then((saved) => {
      setMuted(saved ?? false)
      setMutedState(saved ?? false)
    })
  }, [])
  const toggle = () => {
    setMuted(!muted)
    setMutedState(!muted)
    void saveGameData('sfx:muted', !muted)
  }
  return (
    <Button
      variant="secondary"
      size="icon"
      className={HUD_BUTTON}
      onClick={toggle}
      aria-label={muted ? 'روشن کردن صدا' : 'بی‌صدا'}
      aria-pressed={muted}
    >
      {muted ? <VolumeX /> : <Volume2 />}
    </Button>
  )
}

const FullscreenToggle = () => {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const sync = () => setOn(!!document.fullscreenElement)
    sync()
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])
  // iPhone Safari has no element fullscreen; the installed PWA is already fullscreen there.
  if (typeof document === 'undefined' || !document.fullscreenEnabled) return null
  const toggle = () =>
    void (on ? document.exitFullscreen() : document.documentElement.requestFullscreen({ navigationUI: 'hide' })).catch(
      () => {},
    )
  return (
    <Button
      variant="secondary"
      size="icon"
      className={HUD_BUTTON}
      onClick={toggle}
      aria-label={on ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}
    >
      {on ? <Minimize /> : <Maximize />}
    </Button>
  )
}

/**
 * Immersive game screen: a full-viewport layer above the app (tab bar and page chrome hidden),
 * padded for notches and the home indicator. The play area is a size container, so boards and
 * canvases fit it with cqw/cqh units in any orientation.
 */
const GameShell = ({
  title,
  stats,
  overlay,
  onRestart,
  onPause,
  scores,
  formatScore = toFaDigits,
  actions,
  before,
  after,
  children,
}: GameShellProps) => {
  // Leaving the game leaves browser fullscreen too.
  useEffect(
    () => () => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    },
    [],
  )

  const primary = overlay?.onAction ?? onRestart

  return createPortal(
    <section
      className="fixed inset-0 z-50 flex flex-col overflow-hidden overscroll-none bg-background pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] text-foreground select-none"
      aria-label={title}
    >
      <header className="flex items-center gap-2 px-3 pt-2 pb-1">
        <Button variant="secondary" size="icon" className={HUD_BUTTON} asChild>
          <Link to="/games" aria-label="بازگشت به بازی‌ها">
            <ChevronRight />
          </Link>
        </Button>
        {/* Title sits beside the back button, like a native navigation bar; controls stay on the far side. */}
        <h1 className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight">{title}</h1>
        {actions}
        {onPause && (
          <Button variant="secondary" size="icon" className={HUD_BUTTON} onClick={onPause} aria-label="مکث">
            <Pause />
          </Button>
        )}
        <FullscreenToggle />
        <SoundToggle />
      </header>

      {stats && (
        <dl className="mx-auto flex w-full max-w-md justify-center gap-2 px-3 py-1">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-0 flex-1 flex-col items-center rounded-2xl bg-secondary/70 px-2 py-1"
            >
              <dt className="text-[11px] text-muted-foreground">{stat.label}</dt>
              <dd className="text-lg leading-tight font-bold tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {before && <div className="mx-auto w-full max-w-md px-3 pt-2">{before}</div>}

      <div className="relative min-h-0 flex-1">
        <div className="flex size-full flex-col overflow-y-auto px-3 py-3 [container-type:size]">
          {/* my-auto centres without clipping the top when content is taller than the screen. */}
          <div className="my-auto flex w-full shrink-0 flex-col items-center">{children}</div>
        </div>
        {overlay && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/55 p-6 animate-in fade-in duration-200">
            <div
              className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl glass-strong p-6 text-center animate-in zoom-in-95 duration-200"
              role="status"
            >
              <p className="text-2xl font-bold">{overlay.title}</p>
              {overlay.detail && <p className="text-sm text-muted-foreground">{overlay.detail}</p>}
              {primary && (
                <Button size="lg" className="h-12 w-full text-base" autoFocus onClick={primary}>
                  {overlay.action}
                </Button>
              )}
              {overlay.onAction && overlay.restart && onRestart && (
                <Button variant="secondary" size="lg" className="w-full" onClick={onRestart}>
                  <RotateCcw /> از اول
                </Button>
              )}
              {scores && scores.length > 0 && (
                <ol className="mt-1 w-full space-y-1 border-t pt-3 text-sm" aria-label="بهترین امتیازها">
                  {scores.map((entry, i) => (
                    <li key={entry.at} className="flex justify-between tabular-nums">
                      <span className="text-muted-foreground">{toFaDigits(i + 1)}.</span>
                      <span className={i === 0 ? 'font-bold' : undefined}>{formatScore(entry.score)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>

      {after && <div className="mx-auto w-full max-w-md px-3 pt-1 pb-3">{after}</div>}
    </section>,
    document.body,
  )
}

/** Canvas fitted to the play area (a size container) while keeping its world aspect ratio. */
const GameCanvas = ({
  ref,
  width,
  height,
  label,
  ...props
}: {
  ref: React.Ref<HTMLCanvasElement>
  width: number
  height: number
  label: string
} & React.CanvasHTMLAttributes<HTMLCanvasElement>) => {
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      className="block shrink-0 touch-none rounded-3xl shadow-[0_0_0_0.5px_var(--border)] select-none"
      style={{ width: `min(100cqw, calc(100cqh * ${width / height}))`, aspectRatio: `${width} / ${height}` }}
      {...props}
    />
  )
}

export { GameShell, GameCanvas }
