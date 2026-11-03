import { createContext, useSyncExternalStore } from 'react'

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

const COARSE = '(pointer: coarse)'
const subscribeCoarse = (onChange: () => void) => {
  const media = matchMedia(COARSE)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/** Touch devices: full-page HTML capture + WebGL refraction is too slow there, so glass uses CSS blur. */
const useIsTouch = () =>
  useSyncExternalStore(
    subscribeCoarse,
    () => matchMedia(COARSE).matches,
    () => false,
  )

/**
 * What in-page glass (cards, buttons, pills) refracts on the snapshot renderer (iOS/Safari/Firefox): a plain element
 * that is really behind them. The page capture would include each card's own text, refracted as a ghost copy.
 */
const GlassBackdropContext = createContext('#glass-backdrop')

export { useGlassMode, useIsTouch, GlassBackdropContext }
