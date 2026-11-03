import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { LiquidGlassScene } from 'simple-liquid-glass/backdrop'
import { GlassLayer } from '#/components/glass'
import { cn } from '#/modules/shell/utils/cn'
import { useAppShell } from '#/modules/shell/hooks/app-shell.hook'

const AppShell = ({ children }: { children: ReactNode }) => {
  const { navItems, contentStyle, immersive, drop, glass, dragHandlers } = useAppShell()

  return (
    <>
      {/* What in-page glass refracts on iOS/Safari/Firefox (GlassBackdropContext); backdropVersion refreshes it on theme change. */}
      <div id="glass-backdrop" aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background" />
      {/* Scene: floating glass on iOS/Safari/Firefox refracts a snapshot of this subtree (Chromium reads the live page). */}
      <LiquidGlassScene>
        <main
          hidden={immersive}
          // Window scroll, not an inner scroll box: the glass scene tracks window scrolling and only shifts its
          // cached page capture; an inner scroller left the capture stale and forced recaptures (lag on iOS).
        >
          <div style={contentStyle} className="mx-auto w-full max-w-lg px-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
            {children}
          </div>
        </main>

        {!immersive && !glass && (
          // Solid bar: the page fades into the background behind it, so content never shows below or around the bar.
          <div
            aria-hidden
            className="vt-tab-fade pointer-events-none fixed inset-x-0 bottom-0 z-10 h-[calc(6rem+env(safe-area-inset-bottom))] bg-linear-to-t from-background from-45% to-transparent"
          />
        )}
        {!immersive && (
          <nav
            aria-label="منوی اصلی"
            {...dragHandlers}
            className={cn(
              'vt-tab-bar fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] isolate z-10 mx-auto grid max-w-sm grid-cols-5 rounded-full p-1',
              // Solid bar needs a shadow to lift off the page; glass has its own rim and soft shadow.
              glass ? 'touch-none select-none' : 'shadow-[var(--material-shadow)]',
            )}
          >
            <GlassLayer radius={28} soft />
            {/* Water-drop indicator: slides to the active tab, stretching on the way and wobbling as it lands. */}
            <span
              aria-hidden
              hidden={drop.hidden}
              style={drop.style}
              className={cn('nav-drop', drop.dragging && 'nav-drop--drag')}
            >
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
    </>
  )
}

export { AppShell }
