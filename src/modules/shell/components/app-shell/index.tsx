import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { LiquidGlassScene } from 'simple-liquid-glass/backdrop'
import { GlassLayer } from '#/components/glass'
import { useAppShell } from '#/modules/shell/hooks/app-shell.hook'

const AppShell = ({ children }: { children: ReactNode }) => {
  const { navItems, contentStyle, immersive, drop } = useAppShell()

  return (
    // Scene: on iOS/Safari/Firefox the glass refracts a snapshot of this subtree (Chromium reads the live page).
    <LiquidGlassScene>
      <main
        id="app-scroll"
        data-scroll-restoration-id="app-scroll"
        hidden={immersive}
        className="fixed inset-0 overflow-y-auto overscroll-contain"
      >
        <div style={contentStyle} className="mx-auto w-full max-w-lg px-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
          {children}
        </div>
      </main>

      {!immersive && (
        <nav
          aria-label="منوی اصلی"
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] isolate z-10 mx-auto grid max-w-sm grid-cols-5 rounded-full p-1"
        >
          <GlassLayer radius={28} soft />
          {/* Water-drop indicator: slides to the active tab, stretching on the way and wobbling as it lands. */}
          <span aria-hidden hidden={drop.hidden} style={drop.style} className="nav-drop">
            <span key={drop.key} className="nav-drop__body" />
          </span>
          {navItems.map(({ to, label, icon: Icon, activeOptions }) => (
            <Link
              key={to}
              to={to}
              activeOptions={activeOptions}
              className="relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-medium text-muted-foreground transition-[color,background-color,transform] duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 data-[status=active]:text-foreground"
            >
              <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </LiquidGlassScene>
  )
}

export { AppShell }
