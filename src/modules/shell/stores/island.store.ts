import { createFrameClock } from '#/modules/shell/utils/island/clock'
import { resolveMetrics, resolveMotion } from '#/modules/shell/utils/island/config'
import { createIslandStore } from '#/modules/shell/utils/island/store'

/*
 * The app's one Dynamic Island: its clock, its tuning (islandcn's measured defaults) and its
 * activity stack. Module-level, so `notify` can start an activity from any hook or promise, as
 * sonner's `toast` could; `<Island />` in the root app draws it.
 */
const islandClock = createFrameClock()
// No resting pill: the island is nothing until a message arrives, then grows out of a point.
const islandMetrics = resolveMetrics({ idle: { width: 0, height: 0 }, sensor: { opacity: 0 } })
const islandMotion = resolveMotion()
const islandStore = createIslandStore({ clock: islandClock, motion: () => islandMotion })

export { islandClock, islandMetrics, islandMotion, islandStore }
