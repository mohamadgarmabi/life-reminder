import { useSyncExternalStore } from 'react'

const REDUCED = '(prefers-reduced-transparency: reduce)'

// Re-render glass when the theme class flips or the OS "reduce transparency" setting changes.
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  const media = matchMedia(REDUCED)
  media.addEventListener('change', onChange)
  return () => {
    observer.disconnect()
    media.removeEventListener('change', onChange)
  }
}

const snapshot = () =>
  matchMedia(REDUCED).matches ? 'solid' : document.documentElement.classList.contains('dark') ? 'dark' : 'light'

/** 'light' | 'dark' glass, or 'solid' when the user asked the OS to reduce transparency. */
const useGlassMode = () => useSyncExternalStore(subscribe, snapshot, () => 'light' as const)

export { useGlassMode }
