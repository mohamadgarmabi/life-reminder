import { Link } from '@tanstack/react-router'
import { Bell, Flower2, House, Settings, Wallet, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '#/lib/utils'

interface NavItem {
  to: '/' | '/installments' | '/plants' | '/reminders' | '/settings'
  label: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { to: '/', label: 'خانه', icon: House },
  { to: '/installments', label: 'اقساط', icon: Wallet },
  { to: '/plants', label: 'گل‌ها', icon: Flower2 },
  { to: '/reminders', label: 'یادآورها', icon: Bell },
  { to: '/settings', label: 'تنظیمات', icon: Settings },
]

// Tab bar: 48px items + 2×4px padding; its zone also covers the bottom gap/safe area.
const NAV_ZONE = 'calc(4.5rem + max(1rem, env(safe-area-inset-bottom)))'

/**
 * iPhone layout. A fixed "stage" holds the mesh backdrop and the tab bar so LiquidGlass (WebGL)
 * can refract the real backdrop; pages scroll in their own container that ends above the bar.
 * shortcut: the bar refracts only the backdrop, not page content (re-capturing the DOM every
 * scroll frame is too slow on iPhone); upgrade if the library gains cheap scroll capture.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const liquid = useLiquidGlass(stageRef, navRef)

  return (
    <>
      <div ref={stageRef} className="fixed inset-0">
        <div className="mesh absolute inset-0" />
        <nav
          ref={navRef}
          aria-label="منوی اصلی"
          data-config={JSON.stringify({ cornerRadius: 28, blurAmount: 0.3, refraction: 0.6, saturation: 0, edgeHighlight: 0.1, specular: 0, shadowOpacity: 0.18, bevelMode: 0 })}
          className={cn(
            'absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 mx-auto grid max-w-sm grid-cols-5 rounded-full p-1',
            !liquid && 'glass-strong', // CSS glass until / unless WebGL glass is running
          )}
        >
          {/* Fixed tint over the WebGL canvas so the bar's colour doesn't depend on what the refraction samples. */}
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-(--material)" />
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === '/' }}
              className="relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-medium text-muted-foreground transition-[color,background-color,transform] duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 data-[status=active]:bg-accent data-[status=active]:text-foreground"
            >
              <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <main
        id="app-scroll"
        data-scroll-restoration-id="app-scroll"
        style={{ bottom: NAV_ZONE }}
        className="fixed inset-x-0 top-0 overflow-y-auto overscroll-contain mask-[linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent)]"
      >
        <div className="mx-auto w-full max-w-lg px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-6">{children}</div>
      </main>
    </>
  )
}

/** Mounts LiquidGlass on the tab bar; returns true once the WebGL glass is live. */
function useLiquidGlass(stageRef: React.RefObject<HTMLDivElement | null>, navRef: React.RefObject<HTMLElement | null>) {
  const [live, setLive] = useState(false)
  useEffect(() => {
    const root = stageRef.current
    const nav = navRef.current
    if (!root || !nav || matchMedia('(prefers-reduced-transparency: reduce)').matches) return
    let instance: { destroy(): void; markChanged(el?: HTMLElement): void } | undefined
    let cancelled = false
    // Theme switches recolour the mesh via CSS variables, which the library can't detect.
    const themeObserver = new MutationObserver(() => instance?.markChanged())
    import('@ybouane/liquidglass')
      .then(({ LiquidGlass }) => LiquidGlass.init({ root, glassElements: [nav] }))
      .then((lg) => {
        if (cancelled) return lg.destroy()
        instance = lg
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        setLive(true)
      })
      .catch(() => setLive(false)) // no WebGL: keep the CSS glass fallback
    return () => {
      cancelled = true
      themeObserver.disconnect()
      instance?.destroy()
    }
  }, [stageRef, navRef])
  return live
}
