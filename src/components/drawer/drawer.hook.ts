import { useCallback, useEffect, useRef, useState } from 'react'
import type { AnimationEventHandler, CSSProperties, TransitionEventHandler } from 'react'
import type { DrawerSize } from './drawer.types'

/** Tracks when a bottom drawer reaches the top edge of the visible viewport. */
const useDrawerViewport = ({
  size,
  onAnimationEnd,
  onTransitionEnd,
}: {
  size: DrawerSize
  onAnimationEnd?: AnimationEventHandler<HTMLDivElement>
  onTransitionEnd?: TransitionEventHandler<HTMLDivElement>
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [fillsViewport, setFillsViewport] = useState(size === 'full')

  const update = useCallback(() => {
    const node = contentRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    setFillsViewport(size === 'full' || (size === 'auto' && (rect.top <= 8 || rect.height >= viewportHeight - 8)))
  }, [size])

  const handleAnimationEnd: AnimationEventHandler<HTMLDivElement> = (event) => {
    onAnimationEnd?.(event)
    update()
  }

  const handleTransitionEnd: TransitionEventHandler<HTMLDivElement> = (event) => {
    onTransitionEnd?.(event)
    update()
  }

  const contentStyle: CSSProperties = {
    borderTopLeftRadius: fillsViewport ? 0 : '1rem',
    borderTopRightRadius: fillsViewport ? 0 : '1rem',
  }

  useEffect(() => {
    const node = contentRef.current
    if (!node) return
    const observer = new ResizeObserver(update)
    observer.observe(node)
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    update()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [update])

  return { contentRef, fillsViewport, contentStyle, handleAnimationEnd, handleTransitionEnd }
}

export { useDrawerViewport }
