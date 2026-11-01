import { useEffect, useEffectEvent, useRef } from 'react'
import type { CanvasPalette } from '#/modules/games/types'

const readPalette = (): CanvasPalette => {
  const style = getComputedStyle(document.documentElement)
  const v = (name: string) => style.getPropertyValue(name).trim()
  return {
    bg: v('--card'),
    fg: v('--foreground'),
    muted: v('--muted-foreground'),
    line: v('--border'),
    dark: document.documentElement.classList.contains('dark'),
  }
}

/**
 * Canvas render loop for real-time games. Games draw in fixed world units (width × height);
 * the canvas is scaled to its CSS size × devicePixelRatio. State lives in refs, so a frame
 * never re-renders React — only score/status changes do.
 */
const useCanvasGame = (
  width: number,
  height: number,
  onFrame: (ctx: CanvasRenderingContext2D, dt: number, palette: CanvasPalette) => void,
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frame = useEffectEvent(onFrame)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { alpha: false })
    if (!canvas || !ctx) return
    let palette = readPalette()
    let scale = 1

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // 3x screens cost fill-rate for no visible gain
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(((canvas.clientWidth * height) / width) * dpr)
      scale = canvas.width / width
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    const themeObserver = new MutationObserver(() => (palette = readPalette()))
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    let last = performance.now()
    let raf = 0
    const loop = (now: number) => {
      // Clamped so a backgrounded tab or a long frame can't teleport things through walls.
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      ctx.fillStyle = palette.bg
      ctx.fillRect(0, 0, width, height)
      frame(ctx, dt, palette)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      themeObserver.disconnect()
    }
  }, [width, height])

  /** Pointer position in world units. */
  const toWorld = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: ((e.clientX - rect.left) / rect.width) * width, y: ((e.clientY - rect.top) / rect.height) * height }
  }

  return { canvasRef, toWorld }
}

/** Window key listeners that always see the latest handlers (keyup is for held keys). */
const useKeys = (onKey: (e: KeyboardEvent) => void, onKeyUp?: (e: KeyboardEvent) => void) => {
  const down = useEffectEvent(onKey)
  const up = useEffectEvent((e: KeyboardEvent) => onKeyUp?.(e))
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => !(e.target instanceof HTMLInputElement) && down(e)
    const onUp = (e: KeyboardEvent) => up(e)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])
}

export { useCanvasGame, useKeys }
