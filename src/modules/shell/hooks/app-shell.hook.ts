import { Bell, Flower2, House, Settings, Wallet } from 'lucide-react'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { useRouterState } from '@tanstack/react-router'
import type { NavItem } from '#/modules/shell/types'
import { cn } from '#/modules/shell/utils/cn'

const NAV: NavItem[] = [
  { to: '/', label: 'خانه', icon: House },
  { to: '/installments', label: 'اقساط', icon: Wallet },
  { to: '/plants', label: 'گل‌ها', icon: Flower2 },
  { to: '/reminders', label: 'یادآورها', icon: Bell },
  { to: '/settings', label: 'تنظیمات', icon: Settings },
]

// Tab bar: 48px items + 2×4px padding; its zone also covers the bottom gap/safe area.
const NAV_ZONE = 'calc(4.5rem + max(1rem, env(safe-area-inset-bottom)))'

const NAV_CONFIG = JSON.stringify({
  cornerRadius: 28,
  blurAmount: 0.3,
  refraction: 0.6,
  saturation: 0,
  edgeHighlight: 0.1,
  specular: 0,
  shadowOpacity: 0.18,
  bevelMode: 0,
})

const navItems = NAV.map((item) => ({ ...item, activeOptions: { exact: item.to === '/' } }))
const mainStyle = { bottom: NAV_ZONE }

const useLiquidGlass = (
  stageRef: RefObject<HTMLDivElement | null>,
  navRef: RefObject<HTMLElement | null>,
  enabled = true,
) => {
  const [live, setLive] = useState(false)
  useEffect(() => {
    const root = stageRef.current
    const nav = navRef.current
    if (!enabled || !root || !nav || matchMedia('(prefers-reduced-transparency: reduce)').matches) return
    let instance: { destroy(): void } | undefined
    let generation = 0
    const start = () => {
      const run = ++generation
      instance?.destroy()
      instance = undefined
      import('@ybouane/liquidglass')
        .then(({ LiquidGlass }) => LiquidGlass.init({ root, glassElements: [nav] }))
        .then((lg) => {
          if (run !== generation) return lg.destroy()
          instance = lg
          setLive(true)
        })
        .catch(() => run === generation && setLive(false)) // no WebGL: keep the CSS glass fallback
    }
    // The library caches DOM snapshots (mesh, nav tint, icon colours); markChanged() only re-shades them,
    // so a theme switch needs a fresh instance, same as a reload.
    let dark = document.documentElement.classList.contains('dark')
    const themeObserver = new MutationObserver(() => {
      const next = document.documentElement.classList.contains('dark')
      if (next === dark) return
      dark = next
      start()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    start()
    return () => {
      generation++
      themeObserver.disconnect()
      instance?.destroy()
    }
  }, [stageRef, navRef, enabled])
  return live
}

const useAppShell = () => {
  const stageRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  // A game covers the whole screen; the WebGL tab bar redraws every frame, so it is stopped meanwhile.
  const immersive = useRouterState({ select: (s) => /\/games\/[^/]+\/?$/.test(s.location.pathname) })
  const liquid = useLiquidGlass(stageRef, navRef, !immersive)
  const navClassName = cn(
    'absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 mx-auto grid max-w-sm grid-cols-5 rounded-full p-1',
    !liquid && 'glass-strong', // CSS glass until / unless WebGL glass is running
  )
  return { stageRef, navRef, navClassName, navConfig: NAV_CONFIG, navItems, mainStyle, immersive }
}

export { useAppShell, useLiquidGlass }
