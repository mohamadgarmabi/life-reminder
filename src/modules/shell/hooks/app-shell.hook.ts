import { Bell, Flower2, House, Settings, Wallet } from 'lucide-react'
import { useRouterState } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
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

const navItems = NAV.map((item) => ({ ...item, activeOptions: { exact: item.to === '/' } }))
// Content scrolls under the glass tab bar; this padding lets the last item scroll clear of it.
const contentStyle = { paddingBottom: `calc(${NAV_ZONE} + 0.5rem)` }

/** Index of the tab owning this path (same rule as the Links' activeOptions), or -1 off the tab bar. */
const activeIndex = (pathname: string) =>
  NAV.findIndex(({ to }) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)))

const useAppShell = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  // A game covers the whole screen; the tab bar is unmounted meanwhile so its glass renderer is released.
  const immersive = /\/games\/[^/]+\/?$/.test(pathname)
  const active = activeIndex(pathname)
  // --i drives the drop's position; the key restarts its squash-and-stretch on every tab change.
  const drop = { key: active, hidden: active < 0, style: { '--i': Math.max(active, 0) } as CSSProperties }
  return { navItems, contentStyle, immersive, drop }
}

export { useAppShell }
