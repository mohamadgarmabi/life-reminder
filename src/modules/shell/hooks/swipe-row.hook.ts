import { animate, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import {
  createElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { cn } from '#/modules/shell/utils/cn'
import { toFaDigits } from '#/modules/shell/utils/format'
import { swipeRowStyles } from '#/modules/shell/utils/swipe-row.styles'
import type {
  SwipeAction,
  SwipeRowActionView,
  SwipeRowModel,
  SwipeRowPhase,
  SwipeRowProps,
} from '#/modules/shell/types/swipe-row'

const HYST = 10
const FLICK = 110
const DECEL = 0.998
const VMAX = 1500
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]
const SPRING_UI = { type: 'spring' as const, duration: 0.3, bounce: 0 }
const DEFAULT_ACTIONS: SwipeAction[] = [{ id: 'delete', label: 'حذف' }]

type Sample = [number, number]

type Grip = {
  id: number
  x0: number
  y0: number
  grab: number | null
  moved: boolean
  hist: Sample[]
  touch: boolean
}

type Live = {
  move: (event: PointerEvent) => void
  up: (event: PointerEvent) => void
}

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value))

const rubber = (offset: number, dim: number, coefficient: number) =>
  (offset * dim * coefficient) / (dim + coefficient * Math.abs(offset))

const unrubber = (value: number, dim: number, coefficient: number) =>
  (value * dim) / (coefficient * Math.max(1, dim - Math.abs(value)))

const project = (velocity: number) => ((velocity / 1000) * DECEL) / (1 - DECEL)

const velocityOf = (hist: Sample[]) => {
  if (hist.length < 2) return 0
  const start = hist[0]
  const end = hist[hist.length - 1]
  return ((end[1] - start[1]) / Math.max(1, end[0] - start[0])) * 1000
}

const onColor = (hex: string) => {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return '#ffffff'
  const raw = match[1].length === 3 ? [...match[1]].map((ch) => ch + ch).join('') : match[1]
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150 ? '#111111' : '#ffffff'
}

const deleteIcon = createElement(
  'svg',
  {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  },
  createElement('path', {
    d: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z',
  }),
  createElement('path', { d: 'M10 11v6M14 11v6' }),
)

const watchWindow = (live: { current: Live }) => {
  const onMove = (event: PointerEvent) => {
    if (event.isTrusted) live.current.move(event)
  }
  const onUp = (event: PointerEvent) => {
    if (event.isTrusted) live.current.up(event)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
  return () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
  }
}

const useSwipeRow = ({
  children,
  actions = DEFAULT_ACTIONS,
  actionColor = '#e5484d',
  drawerColor = '#3f3f46',
  rowColor = 'var(--card)',
  textColor = 'var(--card-foreground)',
  height,
  radius = 16,
  actionWidth = 80,
  direction = 'left',
  snapBounce = 0.2,
  resistance = 0.55,
  collapseMs = 200,
  commitAt = 0.6,
  fullSwipe = true,
  disabled = false,
  open: openProp,
  onOpenChange,
  onAction,
  onCommit,
  closeOnAction = true,
  haptic = true,
  label = 'ردیف فهرست',
  className = '',
  style,
}: SwipeRowProps): SwipeRowModel => {
  const uid = useId()
  const reduce = useReducedMotion()
  const sign = direction === 'left' ? -1 : 1
  const slotWidth = actionWidth
  const actionCount = actions.length
  const drawerWidth = actionCount * slotWidth
  const resistanceCoef = clamp(resistance, 0.05, 1)
  const primary = actions[0]
  const [openState, setOpenState] = useState(false)
  const [phase, setPhase] = useState<SwipeRowPhase>('idle')
  const [say, setSay] = useState('')
  const open = openProp ?? openState

  const rootRef = useRef<HTMLDivElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef(360)
  const gripRef = useRef<Grip | null>(null)
  const unwatchRef = useRef<(() => void) | null>(null)
  const liveRef = useRef<Live>({} as Live)
  const foldTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const headingRef = useRef<number | null>(null)

  const x = useMotionValue(0)
  const spread = useMotionValue(0)
  const landed = useMotionValue(0)

  const commitPoint = () => Math.max(commitAt * widthRef.current, drawerWidth + slotWidth / 2)
  const canCommit = () => fullSwipe && actionCount > 0 && commitPoint() <= widthRef.current
  const exposed = useTransform(x, (value) => sign * value)
  const surfaceXf = useTransform(x, (value) => `translateX(${value}px)`)
  const railXf = useTransform(exposed, (value: number) => `translateX(${-sign * Math.max(0, drawerWidth - value)}px)`)
  const shift = useTransform(
    [exposed, spread],
    ([exposedValue, spreadValue]: number[]) => spreadValue * Math.max(0, exposedValue - slotWidth),
  )
  const blockXf = useTransform(shift, (value) => `translateX(${sign * value}px)`)
  const glyphXf = useTransform(
    [shift, landed],
    ([shiftValue, landedValue]: number[]) =>
      `translateX(${-sign * landedValue * (shiftValue - (widthRef.current - slotWidth) / 2)}px)`,
  )

  const map = (raw: number) => {
    const width = widthRef.current
    if (raw < 0) return rubber(raw, width, resistanceCoef)
    if (raw <= drawerWidth) return raw
    if (!canCommit()) return drawerWidth + rubber(raw - drawerWidth, width, resistanceCoef)
    const point = commitPoint()
    const knee = drawerWidth + (point - drawerWidth) / resistanceCoef
    return raw <= knee
      ? drawerWidth + resistanceCoef * (raw - drawerWidth)
      : point + rubber(raw - knee, width, resistanceCoef)
  }

  const inv = (exposedValue: number) => {
    const width = widthRef.current
    if (exposedValue < 0) return unrubber(exposedValue, width, resistanceCoef)
    if (exposedValue <= drawerWidth) return exposedValue
    if (!canCommit()) return drawerWidth + unrubber(exposedValue - drawerWidth, width, resistanceCoef)
    const point = commitPoint()
    const knee = drawerWidth + (point - drawerWidth) / resistanceCoef
    return exposedValue <= point
      ? drawerWidth + (exposedValue - drawerWidth) / resistanceCoef
      : knee + unrubber(exposedValue - point, width, resistanceCoef)
  }

  useLayoutEffect(() => {
    const element = rootRef.current
    if (!element) return
    widthRef.current = element.offsetWidth || widthRef.current
    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width
      if (nextWidth) widthRef.current = nextWidth
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(
    () => () => {
      clearTimeout(foldTimerRef.current)
      unwatchRef.current?.()
    },
    [],
  )

  const setOpen = (next: boolean) => {
    if (next === open) return
    setOpenState(next)
    onOpenChange?.(next)
  }

  const settle = (target: number, velocity = 0) => {
    headingRef.current = target
    if (reduce) {
      void animate(x, sign * target, { duration: 0.2, ease: EASE_OUT })
      return
    }
    const flick = Math.abs(velocity) >= FLICK
    void animate(
      x,
      sign * target,
      flick
        ? { type: 'spring', duration: 0.4, bounce: snapBounce, velocity: sign * clamp(velocity, -VMAX, VMAX) }
        : { ...SPRING_UI, velocity: sign * velocity },
    )
  }

  const setSpread = (on: boolean) => {
    if ((spread.get() === 1) === on) return
    if (reduce) spread.set(on ? 1 : 0)
    else void animate(spread, on ? 1 : 0, SPRING_UI)
    if (on && primary) {
      setSay(`رها کنید تا ${primary.label}`)
      if (haptic && gripRef.current?.touch) navigator.vibrate?.(8)
    }
  }

  const commit = (action: SwipeAction, viaKey: boolean, velocity = 0) => {
    const leap = action === primary
    // Content-sized rows: pin the current height so the collapse can transition from px to 0.
    const root = rootRef.current
    if (root && height === undefined) {
      root.style.height = `${root.offsetHeight}px`
      void root.offsetHeight
    }
    setPhase('committing')
    setSay(action.label)
    setOpen(false)

    const fold = () => {
      setPhase('collapsing')
      foldTimerRef.current = setTimeout(() => {
        onCommit?.(action)
        action.onSelect?.()
      }, collapseMs)
    }

    if (viaKey || reduce) {
      if (leap) {
        spread.set(1)
        landed.set(1)
      }
      if (viaKey) {
        x.set(sign * widthRef.current)
        fold()
      } else {
        void animate(x, sign * widthRef.current, { duration: 0.2, ease: EASE_OUT }).then(fold)
      }
      return
    }

    if (leap) {
      if (spread.get() < 1) void animate(spread, 1, SPRING_UI)
      void animate(landed, 1, SPRING_UI)
    }
    void animate(x, sign * widthRef.current, { ...SPRING_UI, velocity: sign * velocity }).then(fold)
  }

  useEffect(() => {
    if (openProp === undefined || gripRef.current || phase !== 'idle') return
    const target = open ? drawerWidth : 0
    if (headingRef.current === target) return
    if (Math.abs(exposed.get() - target) > 0.5) settle(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the controlled value changes
  }, [open, drawerWidth])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || actionCount === 0 || phase !== 'idle' || gripRef.current || event.button !== 0) return
    x.stop()
    headingRef.current = null
    gripRef.current = {
      id: event.pointerId,
      x0: event.clientX,
      y0: event.clientY,
      grab: null,
      moved: false,
      hist: [],
      touch: event.pointerType === 'touch',
    }
    unwatchRef.current?.()
    unwatchRef.current = watchWindow(liveRef)
  }

  const move = (event: PointerEvent) => {
    const grip = gripRef.current
    if (!grip || grip.id !== event.pointerId) return

    if (grip.grab === null) {
      const dx = event.clientX - grip.x0
      const dy = event.clientY - grip.y0
      if (Math.abs(dx) < HYST || Math.abs(dx) < Math.abs(dy)) return
      grip.grab = sign * (grip.x0 + Math.sign(dx) * HYST) - inv(exposed.get())
      grip.moved = true
      rootRef.current?.setAttribute('data-dragging', '')
      // Capture only once a drag starts, so taps still reach buttons inside the row.
      try {
        surfaceRef.current?.setPointerCapture(event.pointerId)
      } catch {
        // ignore capture failures on unsupported targets
      }
    }

    const nextExposed = map(sign * event.clientX - grip.grab)
    x.set(sign * nextExposed)
    grip.hist.push([event.timeStamp, nextExposed])
    if (grip.hist.length > 4) grip.hist.shift()
    setSpread(canCommit() && nextExposed >= commitPoint())
  }

  const up = (event: PointerEvent) => {
    const grip = gripRef.current
    if (!grip || grip.id !== event.pointerId) return

    gripRef.current = null
    unwatchRef.current?.()
    unwatchRef.current = null
    rootRef.current?.removeAttribute('data-dragging')
    try {
      surfaceRef.current?.releasePointerCapture(event.pointerId)
    } catch {
      // ignore
    }

    const nextExposed = exposed.get()
    const velocity = velocityOf(grip.hist)

    if (!grip.moved) {
      if (open) {
        setOpen(false)
        settle(0)
      }
      return
    }

    if (primary && canCommit() && nextExposed >= commitPoint()) {
      commit(primary, false, velocity)
      return
    }

    const target =
      Math.abs(velocity) >= FLICK
        ? velocity > 0
          ? drawerWidth
          : 0
        : nextExposed + project(velocity) > drawerWidth / 2
          ? drawerWidth
          : 0

    setSpread(false)
    setOpen(target === drawerWidth)
    settle(target, velocity)
  }

  // eslint-disable-next-line react-hooks/refs -- window listeners always call the latest handlers
  liveRef.current = { move, up }

  const act = (action: SwipeAction, event: MouseEvent<HTMLButtonElement>) => {
    if (phase !== 'idle') return
    onAction?.(action)
    if (action === primary || action.dismiss) {
      commit(action, event.detail === 0)
      return
    }
    action.onSelect?.()
    if (!closeOnAction) return
    setOpen(false)
    if (event.detail === 0) {
      headingRef.current = 0
      x.set(0)
    } else {
      settle(0)
    }
  }

  const openNow = () => {
    headingRef.current = drawerWidth
    x.set(sign * drawerWidth)
    setOpen(true)
    setSay(`${toFaDigits(actionCount)} گزینه نمایان شد`)
  }

  const closeNow = () => {
    headingRef.current = 0
    x.set(0)
    setOpen(false)
  }

  const handleToggleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || phase !== 'idle' || actionCount === 0) return
    const openKey = sign < 0 ? 'ArrowLeft' : 'ArrowRight'
    const closeKey = sign < 0 ? 'ArrowRight' : 'ArrowLeft'
    const toggle = event.key === 'Enter' || event.key === ' '

    if (event.key === openKey || (toggle && !open)) {
      event.preventDefault()
      openNow()
    } else if (event.key === closeKey || event.key === 'Escape' || (toggle && open)) {
      event.preventDefault()
      closeNow()
    } else if ((event.key === 'Delete' || event.key === 'Backspace') && open && primary && canCommit()) {
      event.preventDefault()
      commit(primary, true)
    }
  }

  const handleToggleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0 || disabled || phase !== 'idle' || actionCount === 0) return
    if (open) closeNow()
    else openNow()
  }

  const toActionView = (action: SwipeAction, index: number): SwipeRowActionView => {
    const color = action.color ?? (index === 0 ? actionColor : drawerColor)
    const styleMap: CSSProperties =
      sign < 0
        ? { right: (index + 1) * slotWidth, background: color, color: onColor(color) }
        : { left: (index + 1) * slotWidth, background: color, color: onColor(color) }

    return {
      id: action.id,
      label: action.label,
      icon: (action.icon ?? (index === 0 ? deleteIcon : null)) as ReactNode,
      color,
      textColor: onColor(color),
      style: styleMap,
      onClick: (event) => act(action, event),
    }
  }

  const secondaryActions = actions.slice(1).map((action, index) => toActionView(action, index))
  const primaryAction = primary
    ? {
        id: primary.id,
        label: primary.label,
        icon: (primary.icon ?? deleteIcon) as ReactNode,
        color: primary.color ?? actionColor,
        textColor: onColor(primary.color ?? actionColor),
        style: {} as CSSProperties,
        onClick: (event: MouseEvent<HTMLButtonElement>) => act(primary, event),
      }
    : null

  const rootStyle = {
    '--sr-h': height === undefined ? 'auto' : `${height}px`,
    '--sr-r': `${radius}px`,
    '--sr-a': `${slotWidth}px`,
    '--sr-row': rowColor,
    '--sr-text': textColor,
    '--sr-drawer': drawerColor,
    '--sr-on-drawer': onColor(drawerColor),
    '--sr-action': actionColor,
    '--sr-on-action': onColor(actionColor),
    '--sr-collapse': `${collapseMs}ms`,
    ...style,
  } as CSSProperties

  return {
    children,
    rootRef,
    surfaceRef,
    rootClassName: cn(swipeRowStyles(), className),
    rootStyle,
    direction,
    open,
    phase,
    disabled,
    railId: `${uid}-rail`,
    say,
    label,
    secondaryActions,
    primaryAction,
    surfaceXf,
    railXf,
    blockXf,
    glyphXf,
    handlePointerDown,
    handleToggleKey,
    handleToggleClick,
    actionsCount: actionCount,
    actionsNoun: 'گزینه',
  }
}

export { useSwipeRow }
