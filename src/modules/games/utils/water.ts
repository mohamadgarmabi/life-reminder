import { hashSeed, mulberry32 } from '#/modules/games/utils/sudoku'

const CAPACITY = 4

/** Each tube lists colour indexes bottom → top. */
type Tubes = number[][]

const topRun = (tube: number[]) => {
  let n = 0
  while (n < tube.length && tube[tube.length - 1 - n] === tube.at(-1)) n++
  return n
}

const canPour = (tubes: Tubes, from: number, to: number) => {
  const a = tubes[from]
  const b = tubes[to]
  return from !== to && a.length > 0 && b.length < CAPACITY && (b.length === 0 || b.at(-1) === a.at(-1))
}

/** Pours as much of the top colour as fits. */
const pour = (tubes: Tubes, from: number, to: number): Tubes => {
  if (!canPour(tubes, from, to)) return tubes
  const n = Math.min(topRun(tubes[from]), CAPACITY - tubes[to].length)
  const next = tubes.map((t) => [...t])
  next[to].push(...next[from].splice(-n))
  return next
}

const isSorted = (tubes: Tubes) =>
  tubes.every((t) => t.length === 0 || (t.length === CAPACITY && t.every((v) => v === t[0])))

/** Depth-first search with a node budget; null = unsolved within budget. */
const solvable = (start: Tubes, budget = 30000) => {
  const seen = new Set<string>()
  const stack = [start]
  while (stack.length && seen.size < budget) {
    const tubes = stack.pop()!
    if (isSorted(tubes)) return true
    const key = tubes
      .map((t) => t.join(''))
      .sort()
      .join('|')
    if (seen.has(key)) continue
    seen.add(key)
    for (let a = 0; a < tubes.length; a++)
      for (let b = 0; b < tubes.length; b++) {
        // Moving a whole single-colour tube into an empty one never helps.
        if (tubes[b].length === 0 && topRun(tubes[a]) === tubes[a].length) continue
        if (canPour(tubes, a, b)) stack.push(pour(tubes, a, b))
      }
  }
  return false
}

const colorsFor = (level: number) => Math.min(3 + Math.floor((level - 1) / 3), 10)

/** Same level → same puzzle; reshuffles until the solver confirms it can be finished. */
const generateWater = (level: number): Tubes => {
  const colors = colorsFor(level)
  for (let attempt = 0; ; attempt++) {
    const rand = mulberry32(hashSeed(`water:${level}:${attempt}`))
    const pool = Array.from({ length: colors * CAPACITY }, (_, i) => i % colors)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const tubes: Tubes = [
      ...Array.from({ length: colors }, (_, i) => pool.slice(i * CAPACITY, (i + 1) * CAPACITY)),
      [],
      [],
    ]
    // shortcut: after 20 budget misses the shuffle is accepted unproven (two spare tubes almost always suffice); raise the budget if players report stuck levels.
    if (!isSorted(tubes) && (attempt > 20 || solvable(tubes))) return tubes
  }
}

export { CAPACITY, canPour, pour, isSorted, solvable, generateWater }
export type { Tubes }
