/** Lane centres on the x axis; the player stays at z = 0 and the world scrolls towards +z. */
const LANES = [-2, 0, 2]
const SPAWN_Z = -90
const POOL = 36
const JUMP_SPEED = 9
const GRAVITY = 28
/** A low barrier is cleared when the player's feet are above this. */
const LOW_HEIGHT = 0.9

type ThingKind = 'low' | 'high' | 'orb'
type Thing = { active: boolean; kind: ThingKind; lane: number; z: number }

type Runner = {
  lane: number
  x: number
  y: number
  vy: number
  speed: number
  distance: number
  orbs: number
  /** Metres until the next row of obstacles. */
  nextRow: number
  /** Fixed pool, reused so the scene never allocates meshes mid-run. */
  things: Thing[]
  alive: boolean
}

const createRunner = (): Runner => ({
  lane: 1,
  x: 0,
  y: 0,
  vy: 0,
  speed: 14,
  distance: 0,
  orbs: 0,
  nextRow: 30,
  things: Array.from({ length: POOL }, () => ({ active: false, kind: 'orb' as ThingKind, lane: 0, z: 0 })),
  alive: true,
})

const moveLane = (r: Runner, dir: -1 | 1) => {
  if (r.alive) r.lane = Math.min(Math.max(r.lane + dir, 0), LANES.length - 1)
}

const jump = (r: Runner) => {
  if (r.alive && r.y === 0) r.vy = JUMP_SPEED
}

const place = (r: Runner, kind: ThingKind, lane: number) => {
  const slot = r.things.find((t) => !t.active)
  if (slot) Object.assign(slot, { active: true, kind, lane, z: SPAWN_Z })
}

/** One row: a guaranteed free lane (often with an orb), the others maybe blocked. */
const spawnRow = (r: Runner, rand: () => number) => {
  const free = Math.floor(rand() * LANES.length)
  for (let lane = 0; lane < LANES.length; lane++) {
    if (lane === free) {
      if (rand() < 0.45) place(r, 'orb', lane)
    } else if (rand() < 0.65) place(r, rand() < 0.5 ? 'low' : 'high', lane)
  }
}

/** Advances the run; mutates in place (called every frame). */
const stepRunner = (r: Runner, dt: number, rand = Math.random) => {
  const events = { orb: false, crash: false }
  if (!r.alive) return events
  r.speed = Math.min(14 + r.distance * 0.02, 34)
  const dz = r.speed * dt
  r.distance += dz
  r.x += (LANES[r.lane] - r.x) * Math.min(1, dt * 14)
  r.vy -= GRAVITY * dt
  r.y = Math.max(0, r.y + r.vy * dt)
  if (r.y === 0) r.vy = 0

  for (const t of r.things) {
    if (!t.active) continue
    t.z += dz
    if (t.z > 6) t.active = false
  }
  r.nextRow -= dz
  if (r.nextRow <= 0) {
    spawnRow(r, rand)
    r.nextRow = Math.max(9, 18 - r.distance * 0.004)
  }

  for (const t of r.things) {
    if (!t.active || Math.abs(t.z) > 0.7 || Math.abs(LANES[t.lane] - r.x) > 1.1) continue
    if (t.kind === 'orb') {
      t.active = false
      r.orbs++
      events.orb = true
    } else if (t.kind === 'high' || r.y < LOW_HEIGHT) {
      r.alive = false
      events.crash = true
    }
  }
  return events
}

const runnerScore = (r: Runner) => Math.floor(r.distance) + r.orbs * 10

export { LANES, SPAWN_Z, POOL, createRunner, moveLane, jump, stepRunner, runnerScore }
export type { Runner, Thing, ThingKind }
