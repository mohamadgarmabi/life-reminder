import { useSelector } from '@tanstack/react-store'
import type { MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { cn } from '#/modules/shell/utils/cn'
import { settingsStore, updateSettings } from '#/modules/settings/stores/settings.store'

const useThemeCard = () => {
  const theme = useSelector(settingsStore, (s) => s.theme)
  // 'system' (the default until the first tap) resolves to whatever the OS uses.
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = dark ? 'light' : 'dark'
    const apply = () => {
      document.documentElement.classList.toggle('dark', next === 'dark')
      flushSync(() => updateSettings({ theme: next }))
    }
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply()
    // New theme grows as a circle from the button until it covers the farthest screen corner.
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    void document
      .startViewTransition(apply)
      .ready.then(() =>
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 550, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
        ),
      )
  }

  return {
    ariaLabel: dark ? 'پوستهٔ روشن' : 'پوستهٔ تیره',
    sunClassName: cn('absolute transition-all duration-500', dark && '-rotate-90 scale-0 opacity-0'),
    moonClassName: cn('absolute transition-all duration-500', !dark && 'rotate-90 scale-0 opacity-0'),
    handleToggle,
  }
}

export { useThemeCard }
