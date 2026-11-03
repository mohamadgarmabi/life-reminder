import { Bell, Flower2, House, Settings, Wallet } from 'lucide-react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useSelector } from '@tanstack/react-store'
import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { useGlassMode } from '#/components/glass/glass.hook'
import { settingsStore } from '#/modules/settings/stores/settings.store'
import type { NavItem } from '#/modules/shell/types'

const NAV: NavItem[] = [
  { to: '/', label: 'خانه', icon: House },
  { to: '/installments', label: 'اقساط', icon: Wallet },
  { to: '/plants', label: 'گل‌ها', icon: Flower2 },
  { to: '/reminders', label: 'یادآورها', icon: Bell },
  { to: '/settings', label: 'تنظیمات', icon: Settings },
]

// Tab bar: 48px items + 2×4px padding; its zone also covers the bottom gap/safe area.
const NAV_ZONE = 'calc(4.5rem + max(1rem, env(safe-area-inset-bottom)))'
const NAV_PADDING = 4
/** Finger travel before a press on the bar turns into dragging the drop. */
const DRAG_SLOP = 8

const navItems = NAV.map((item) => ({ ...item, activeOptions: { exact: item.to === '/' } }))
// Content scrolls under the glass tab bar; this padding lets the last item scroll clear of it.
const contentStyle = { paddingBottom: `calc(${NAV_ZONE} + 0.5rem)` }

/** Index of the tab owning this path (same rule as the Links' activeOptions), or -1 off the tab bar. */
const activeIndex = (pathname: string) =>
  NAV.findIndex(({ to }) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)))

/** Fractional tab index under x (RTL: tab 0 is on the right), clamped to the bar. */
const indexAt = (nav: HTMLElement, x: number) => {
  const r = nav.getBoundingClientRect()
  const item = (r.width - 2 * NAV_PADDING) / NAV.length
  return Math.min(NAV.length - 1, Math.max(0, (r.right - NAV_PADDING - x) / item - 0.5))
}

const useAppShell = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const glassEnabled = useSelector(settingsStore, (s) => s.glassEnabled)
  const glass = useGlassMode() !== 'solid' && glassEnabled
  // A game covers the whole screen; the tab bar is unmounted meanwhile so its glass renderer is released.
  const immersive = /\/games\/[^/]+\/?$/.test(pathname)
  const active = activeIndex(pathname)

  // Glass bar: press and slide along it to carry the drop to another tab, like iOS.
  const pressX = useRef<number | null>(null)
  const [dragAt, setDragAt] = useState<number | null>(null)
  const endDrag = () => {
    pressX.current = null
    setDragAt(null)
  }
  const dragHandlers = glass
    ? {
        onPointerDown: (e: PointerEvent<HTMLElement>) => {
          if (e.isPrimary && e.button === 0) pressX.current = e.clientX
        },
        onPointerMove: (e: PointerEvent<HTMLElement>) => {
          if (pressX.current === null) return
          if (dragAt === null && Math.abs(e.clientX - pressX.current) < DRAG_SLOP) return
          // Captured: the release lands on the nav, so the tab Link under the finger doesn't also fire.
          e.currentTarget.setPointerCapture(e.pointerId)
          setDragAt(indexAt(e.currentTarget, e.clientX))
        },
        onPointerUp: () => {
          if (dragAt !== null) void navigate({ to: NAV[Math.round(dragAt)].to })
          endDrag()
        },
        onPointerCancel: endDrag,
      }
    : {}

  const dragging = dragAt !== null
  // --i drives the drop's position; the key restarts its squash-and-stretch on every tab change.
  const drop = {
    key: active,
    hidden: active < 0 && !dragging,
    dragging,
    style: { '--i': dragging ? dragAt : Math.max(active, 0) } as CSSProperties,
  }
  return { navItems, contentStyle, immersive, drop, glass, dragHandlers }
}

export { useAppShell }
