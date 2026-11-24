import { useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { GlassTabs } from '#/components/liquid-glass'
import { useAppShell } from '#/modules/shell/hooks/app-shell.hook'

const AppShell = ({ children }: { children: ReactNode }) => {
  const { navItems, navLabel, contentStyle, immersive, activeValue } = useAppShell()
  const navigate = useNavigate()

  return (
    <>
      <main hidden={immersive}>
        <div style={contentStyle} className="mx-auto w-full max-w-lg px-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
          {children}
        </div>
      </main>

      {!immersive && (
        // Solid bar: the page fades into the background behind it, so content never shows below or around the bar.
        <div
          aria-hidden
          className="vt-tab-fade pointer-events-none fixed inset-x-0 bottom-0 z-10 h-[calc(6rem+env(safe-area-inset-bottom))] bg-linear-to-t from-background from-45% to-transparent"
        />
      )}
      {!immersive && (
        <nav aria-label={navLabel} className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 mx-auto max-w-sm">
          <GlassTabs
            aria-label={navLabel}
            size="lg"
            value={activeValue}
            onValueChange={(to) => void navigate({ to })}
            options={navItems.map(({ to, label, icon: Icon }) => ({
              value: to,
              label,
              icon: <Icon strokeWidth={1.75} aria-hidden />,
              'aria-label': label,
            }))}
            className="vt-tab-bar w-full justify-between border border-foreground/10 !bg-transparent backdrop-blur-sm shadow-[var(--material-shadow)] [&_[role=radio]]:min-w-0 [&_[role=radio]]:flex-1 [&_[role=radio]]:flex-col [&_[role=radio]]:gap-0.5 [&_[role=radio]]:px-0 [&_[role=radio]]:text-[9px] [&_[role=radio]_svg]:size-4"
          />
        </nav>
      )}
    </>
  )
}

export { AppShell }
