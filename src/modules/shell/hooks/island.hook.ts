import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import type { IslandSurfaceProps, PressTarget, SurfaceInteraction } from '#/modules/shell/types/island'
import { islandClock, islandMetrics, islandMotion, islandStore } from '#/modules/shell/stores/island.store'
import { sceneOf } from '#/modules/shell/utils/island/store'

// The keyline (a faint band that separates the black pill from a black page) follows the app's
// theme, which lives in the `dark` class on <html> (shell.hook), not the system setting.
const subscribeTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}
const readDark = () => document.documentElement.classList.contains('dark')

/** The app's island: draws the activity stack that `notify` fills. */
const useIsland = () => {
  const snapshot = useSyncExternalStore(islandStore.subscribe, islandStore.getSnapshot, islandStore.getSnapshot)
  const scene = sceneOf(snapshot)
  const reduced = useReducedMotion() ?? false
  const dark = useSyncExternalStore(subscribeTheme, readDark, () => false)
  const root = useRef<HTMLDivElement | null>(null)
  const expanded = scene.presentation.kind === 'expanded'

  // A press outside the island, or Escape, collapses an expanded island.
  useEffect(() => {
    if (!expanded) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && root.current?.contains(target)) return
      islandStore.api.collapse()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const focusInside = root.current?.contains(document.activeElement) ?? false
      islandStore.api.collapse()
      if (focusInside) root.current?.querySelector<HTMLButtonElement>('[data-islandcn-hit="pill"]')?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [expanded])

  const primaryLabel = scene.primary?.label ?? null
  const interaction: SurfaceInteraction = {
    // With no activity the pill still swells under a press, but it is not a control.
    pillLabel:
      primaryLabel === null
        ? null
        : expanded
          ? `${primaryLabel}، باز است. برای بستن Escape را بزنید.`
          : `${primaryLabel}. برای باز کردن بزنید.`,
    bubbleLabel: scene.detached ? `${scene.detached.label}. برای باز کردن بزنید.` : null,
    expanded,
    onPressStart: (target: PressTarget, event) => {
      if (event.button !== 0) return
      islandStore.press(target)
    },
    onPressEnd: () => islandStore.release(),
    onPressCancel: () => islandStore.release({ cancel: true }),
    onActivate: (target: PressTarget) => {
      if (expanded) {
        islandStore.api.collapse()
        return
      }
      const activity = target === 'bubble' ? scene.detached : scene.primary
      if (activity) islandStore.api.expand(activity.id)
    },
  }

  const surfaceProps: IslandSurfaceProps = {
    presentation: scene.presentation,
    contentKey: scene.contentKey,
    change: { id: snapshot.changeId, at: snapshot.changedAt, instant: snapshot.instant },
    pressed: snapshot.pressed,
    joining: snapshot.joining,
    pressStyle: 'swell',
    activityId: scene.primary?.id ?? null,
    alerting: snapshot.expanded?.reason === 'alert',
    handingOff: snapshot.handoff !== null,
    // Pinned to the top centre of the window, over every screen (games and sheets included).
    placement: 'viewport',
    regionLabel: 'اعلان‌ها',
    liveLabel: scene.label,
    clock: islandClock,
    metrics: islandMetrics,
    motion: islandMotion,
    reduced,
    keyline: dark ? islandMetrics.keyline.alpha : 0,
    interaction,
    rootRef: (element) => {
      root.current = element
    },
  }

  return { surfaceProps }
}

export { useIsland }
