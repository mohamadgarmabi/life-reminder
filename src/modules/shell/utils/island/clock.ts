import type { IslandClock } from '#/modules/shell/types/island'

interface Timer {
  id: number
  at: number
  run: (due: number) => void
}

const hasWindow = () => typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'

/**
 * The real clock: wall time from `performance.now()`, frames from `requestAnimationFrame`.
 * islandcn's pause, step, seek and time-scale controls served its devtools only, so they are left out.
 */
const createFrameClock = (): IslandClock => {
  const frameListeners = new Set<(now: number) => void>()
  let timers: Timer[] = []
  let nextTimerId = 1
  let raf = 0

  const now = () => (typeof performance === 'undefined' ? Date.now() : performance.now())

  const runTimersUntil = (time: number) => {
    for (;;) {
      const due = timers.filter((timer) => timer.at <= time).sort((a, b) => a.at - b.at || a.id - b.id)[0]
      if (!due) return
      timers = timers.filter((timer) => timer.id !== due.id)
      due.run(due.at)
    }
  }

  const loop = () => {
    raf = 0
    const time = now()
    runTimersUntil(time)
    for (const listener of [...frameListeners]) listener(time)
    schedule()
  }

  const schedule = () => {
    if (raf || !hasWindow()) return
    if (frameListeners.size === 0 && timers.length === 0) return
    raf = window.requestAnimationFrame(loop)
  }

  const onFrame = (listener: (now: number) => void) => {
    frameListeners.add(listener)
    schedule()
    return () => {
      frameListeners.delete(listener)
    }
  }

  const at = (time: number, run: (due: number) => void) => {
    const id = nextTimerId++
    timers.push({ id, at: time, run })
    schedule()
    return () => {
      timers = timers.filter((timer) => timer.id !== id)
    }
  }

  return { now, onFrame, at }
}

export { createFrameClock }
