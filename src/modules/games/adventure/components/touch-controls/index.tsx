import { useRef, useState, type PointerEvent } from 'react'
import { Hand } from 'lucide-react'
import { useGame, useRuntimeRef } from '#/modules/games/adventure/stores/session.store'
import { cn } from '#/modules/shell/utils/cn'

const STICK_RADIUS = 56

type Stick = { id: number; ox: number; oy: number; dx: number; dy: number }

/**
 * Floating joystick on the movement half, drag-to-look on the other, one contextual action button.
 * Sides are physical (not mirrored for RTL); "left-handed" swaps them. Pointer events, so a mouse works too.
 */
const TouchControls = () => {
  const runtimeRef = useRuntimeRef()
  const leftHanded = useGame((g) => g.settings.leftHanded)
  const nearby = useGame((g) => g.nearby)
  const [stick, setStick] = useState<Stick | null>(null)
  const look = useRef<{ id: number; x: number; y: number } | null>(null)

  const isMoveSide = (x: number, width: number) => (leftHanded ? x > width / 2 : x < width / 2)

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.setPointerCapture(e.pointerId)
    if (!stick && isMoveSide(x, rect.width)) setStick({ id: e.pointerId, ox: x, oy: y, dx: 0, dy: 0 })
    else if (!look.current) look.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const runtime = runtimeRef.current
    if (stick?.id === e.pointerId) {
      const rect = e.currentTarget.getBoundingClientRect()
      let dx = e.clientX - rect.left - stick.ox
      let dy = e.clientY - rect.top - stick.oy
      const len = Math.hypot(dx, dy)
      if (len > STICK_RADIUS) {
        dx = (dx / len) * STICK_RADIUS
        dy = (dy / len) * STICK_RADIUS
      }
      runtime.input.move.x = dx / STICK_RADIUS
      runtime.input.move.y = -dy / STICK_RADIUS
      setStick({ ...stick, dx, dy })
    } else if (look.current?.id === e.pointerId) {
      runtime.input.look.x += e.clientX - look.current.x
      runtime.input.look.y += e.clientY - look.current.y
      look.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
    }
  }

  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const runtime = runtimeRef.current
    if (stick?.id === e.pointerId) {
      runtime.input.move.x = 0
      runtime.input.move.y = 0
      setStick(null)
    }
    if (look.current?.id === e.pointerId) look.current = null
  }

  const use = () => {
    const target = nearby && runtimeRef.current.interactables.get(nearby.id)
    target?.onUse()
  }

  return (
    <>
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        aria-hidden
      >
        {stick && (
          <div
            className="pointer-events-none absolute size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-sm"
            style={{ left: stick.ox, top: stick.oy }}
          >
            <div
              className="absolute top-1/2 left-1/2 size-12 rounded-full bg-white/70 shadow-lg"
              style={{ transform: `translate(calc(-50% + ${stick.dx}px), calc(-50% + ${stick.dy}px))` }}
            />
          </div>
        )}
      </div>
      {nearby && (
        <button
          type="button"
          onClick={use}
          className={cn(
            'absolute bottom-[calc(env(safe-area-inset-bottom)+7rem)] flex min-h-14 min-w-14 items-center gap-2 rounded-full bg-amber-200/90 px-5 text-base font-bold text-amber-950 shadow-xl backdrop-blur animate-in fade-in zoom-in-90',
            leftHanded
              ? 'left-[calc(env(safe-area-inset-left)+1.25rem)]'
              : 'right-[calc(env(safe-area-inset-right)+1.25rem)]',
          )}
        >
          <Hand className="size-5" aria-hidden />
          {nearby.label}
        </button>
      )}
    </>
  )
}

export { TouchControls }
