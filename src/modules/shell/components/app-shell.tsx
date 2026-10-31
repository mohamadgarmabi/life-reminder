import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useAppShell } from '#/modules/shell/hooks/app-shell.hook'

const AppShell = ({ children }: { children: ReactNode }) => {
  const { stageRef, navRef, navClassName, navConfig, navItems, mainStyle } = useAppShell()

  return (
    <>
      <div ref={stageRef} className="fixed inset-0">
        <div className="mesh absolute inset-0" />
        <nav ref={navRef} aria-label="منوی اصلی" data-config={navConfig} className={navClassName}>
          {/* Fixed tint over the WebGL canvas so the bar's colour doesn't depend on what the refraction samples. */}
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-(--material)" />
          {navItems.map(({ to, label, icon: Icon, activeOptions }) => (
            <Link
              key={to}
              to={to}
              activeOptions={activeOptions}
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
        style={mainStyle}
        className="fixed inset-x-0 top-0 overflow-y-auto overscroll-contain mask-[linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent)]"
      >
        <div className="mx-auto w-full max-w-lg px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-6">{children}</div>
      </main>
    </>
  )
}

export { AppShell }
