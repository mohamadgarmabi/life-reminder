/**
 * Highway driving with smooth steering. Metres and m/s throughout. The player's car stays at z = 0 and the
 * world moves past it; traffic z is relative to the player (negative = ahead).
 */
const LANE_WIDTH = 3.5
/** Lane centres, left (fast) to right (slow). */
const LANES = [-1.5, -0.5, 0.5, 1.5].map((k) => k * LANE_WIDTH)
/** Vehicle types: real-world sizes (metres) and top speed (km/h); the scene loads one model per entry, same order. */
const VEHICLES = [
  { id: 'hatch', length: 4.1, width: 1.8, weight: 3, topSpeed: 190 },
  { id: 'sedan', length: 4.7, width: 1.85, weight: 3, topSpeed: 210 },
  { id: 'classic', length: 4.9, width: 1.85, weight: 2, topSpeed: 175 },
  { id: 'pickup', length: 5.1, width: 1.95, weight: 2, topSpeed: 165 },
  { id: 'truck', length: 6.6, width: 2.2, weight: 1, topSpeed: 130 },
] as const
/** Default player vehicle (the hatchback). */
const PLAYER = VEHICLES[0]
/** Furthest a car centre of this width can go before scraping the guardrail. */
const edgeFor = (width: number) => 2 * LANE_WIDTH + 0.5 - width / 2
const EDGE = edgeFor(PLAYER.width)

/** Speeds in m/s, spawn gaps in metres; `lanes` is how eagerly traffic changes lanes. */
const DIFFICULTIES = {
  easy: { start: 18, top: 30, growth: 0.002, max: 45, spawn: 44, spawnMin: 18, lanes: 0.4, multiplier: 1 },
  medium: { start: 22, top: 36, growth: 0.004, max: 58, spawn: 34, spawnMin: 10, lanes: 0.8, multiplier: 1.5 },
  hard: { start: 26, top: 42, growth: 0.005, max: 66, spawn: 26, spawnMin: 8, lanes: 1.2, multiplier: 2 },
  legendary: { start: 30, top: 48, growth: 0.006, max: 75, spawn: 20, spawnMin: 6, lanes: 1.8, multiplier: 3 },
} as const
/** Tyre grip: wet and snowy roads steer and brake slower. */
const GRIP = { normal: 1, cloudy: 1, rain: 0.75, snow: 0.55 } as const
type Difficulty = keyof typeof DIFFICULTIES
type Weather = keyof typeof GRIP
type RunOptions = { vehicle: number; difficulty: Difficulty; weather: Weather }
const POOL = 14
const SPAWN_Z = -240
const DESPAWN_BEHIND = 40
const LANE_CHANGE_SPEED = 1.8
/** Overlap shrink so a graze that looks like a miss is a miss. */
const HIT_SLACK = 0.92
const NEAR_MISS_GAP = 0.9

type Car = {
  active: boolean
  lane: number
  targetLane: number
  x: number
  z: number
  speed: number
  /** Speed this driver wants when the lane ahead is clear. */
  cruise: number
  /** Index into VEHICLES. */
  model: number
  passed: boolean
}

type Traffic = RunOptions & {
  x: number
  /** Smoothed steering, -1 (left) … 1 (right). */
  steer: number
  speed: number
  distance: number
  passed: number
  nearMisses: number
  /** Metres of closing distance until the next spawn. */
  nextSpawn: number
  cars: Car[]
  alive: boolean
}

type DriveInput = { steer: number; brake: boolean }

/** Top speed grows with distance (medium: 130 km/h at the start, 210 km/h after ~6 km), capped by the car itself. */
const topSpeed = (t: Traffic) => {
  const d = DIFFICULTIES[t.difficulty]
  return Math.min(d.top + t.distance * d.growth, d.max, VEHICLES[t.vehicle].topSpeed / 3.6)
}

const createTraffic = ({
  vehicle = 0,
  difficulty = 'medium',
  weather = 'normal',
}: Partial<RunOptions> = {}): Traffic => ({
  vehicle,
  difficulty,
  weather,
  x: LANES[2],
  steer: 0,
  speed: DIFFICULTIES[difficulty].start,
  distance: 0,
  passed: 0,
  nearMisses: 0,
  nextSpawn: 0,
  cars: Array.from({ length: POOL }, () => ({
    active: false,
    lane: 0,
    targetLane: 0,
    x: 0,
    z: 0,
    speed: 0,
    cruise: 0,
    model: 0,
    passed: false,
  })),
  alive: true,
})

const occupies = (c: Car, lane: number) => c.active && (c.lane === lane || c.targetLane === lane)

/** A lane is free for `car` if no other car is near it there and the player isn't alongside. */
const laneFree = (t: Traffic, car: Car, lane: number) =>
  lane >= 0 &&
  lane < LANES.length &&
  !t.cars.some((o) => o !== car && occupies(o, lane) && Math.abs(o.z - car.z) < 16) &&
  !(Math.abs(car.z) < 14 && Math.abs(t.x - LANES[lane]) < LANE_WIDTH)

const spawn = (t: Traffic, rand: () => number, z = SPAWN_Z) => {
  const slot = t.cars.find((c) => !c.active)
  if (!slot) return
  const lanes = LANES.map((_, i) => i).filter(
    (lane) => !t.cars.some((c) => occupies(c, lane) && Math.abs(c.z - z) < 30),
  )
  // Keep at least one lane open around the spawn point.
  const busy = new Set(t.cars.filter((c) => c.active && Math.abs(c.z - z) < 25).map((c) => c.lane))
  if (!lanes.length || busy.size >= LANES.length - 1) return
  const lane = lanes[Math.floor(rand() * lanes.length)]
  // Trucks keep to the two right-hand lanes.
  const choices = VEHICLES.flatMap((v, i) => (v.id === 'truck' && lane < 2 ? [] : Array<number>(v.weight).fill(i)))
  const model = choices[Math.floor(rand() * choices.length)]
  // Left lanes are faster, like a real highway; trucks are slower still.
  const cruise = 31 - lane * 3 + rand() * 5 - (VEHICLES[model].id === 'truck' ? 5 : 0)
  Object.assign(slot, {
    active: true,
    lane,
    targetLane: lane,
    x: LANES[lane],
    z,
    speed: cruise,
    cruise,
    model,
    passed: false,
  })
}

/** Puts traffic on the road for the start of a run, so the first cars aren't 30 s away. */
const populate = (t: Traffic, rand = Math.random) => {
  for (let z = -60; z > SPAWN_Z; z -= 28 + rand() * 20) spawn(t, rand, z)
}

const stepCar = (t: Traffic, c: Car, dt: number, rand: () => number) => {
  let lead: Car | null = null
  for (const o of t.cars)
    if (o !== c && occupies(o, c.lane) && o.z < c.z && c.z - o.z < 40 && (!lead || o.z > lead.z)) lead = o
  const gap = lead ? c.z - lead.z - (VEHICLES[c.model].length + VEHICLES[lead.model].length) / 2 : Infinity
  const want = lead && gap < 22 ? Math.min(c.cruise, lead.speed * (gap < 8 ? 0.85 : 1)) : c.cruise
  c.speed += (want - c.speed) * Math.min(1, dt * 1.5)

  // Stuck behind someone (or now and then anyway): try a neighbouring lane.
  const eager = DIFFICULTIES[t.difficulty].lanes
  if (c.targetLane === c.lane && ((gap < 30 && rand() < dt * eager) || rand() < dt * 0.025 * eager)) {
    const dir = rand() < 0.5 ? -1 : 1
    for (const lane of [c.lane + dir, c.lane - dir])
      if (laneFree(t, c, lane)) {
        c.targetLane = lane
        break
      }
  }
  const dx = LANES[c.targetLane] - c.x
  c.x += Math.sign(dx) * Math.min(Math.abs(dx), LANE_CHANGE_SPEED * dt)
  if (c.x === LANES[c.targetLane]) c.lane = c.targetLane
}

/** Advances one frame; mutates in place. */
const stepTraffic = (t: Traffic, input: DriveInput, dt: number, rand = Math.random) => {
  const events = { pass: false, nearMiss: false, crash: false, scrape: false }
  if (!t.alive) return events

  const grip = GRIP[t.weather]
  const me = VEHICLES[t.vehicle]
  if (input.brake) t.speed = Math.max(0, t.speed - 16 * grip * dt)
  else t.speed += (topSpeed(t) - t.speed) * Math.min(1, dt * 0.3)
  t.distance += t.speed * dt

  t.steer += (Math.max(-1, Math.min(1, input.steer)) - t.steer) * Math.min(1, dt * 8 * grip)
  t.x += t.steer * (3 + t.speed * 0.12) * (0.6 + 0.4 * grip) * dt
  const edge = edgeFor(me.width)
  if (Math.abs(t.x) > edge) {
    t.x = Math.sign(t.x) * edge
    t.speed = Math.max(0, t.speed - 20 * dt)
    events.scrape = true
  }

  for (const c of t.cars) {
    if (!c.active) continue
    stepCar(t, c, dt, rand)
    c.z += (t.speed - c.speed) * dt
    const dx = Math.abs(c.x - t.x)
    const v = VEHICLES[c.model]
    const reachZ = (v.length + me.length) / 2
    const reachX = (v.width + me.width) / 2
    if (!c.passed && c.z > reachZ) {
      c.passed = true
      t.passed++
      events.pass = true
      if (dx < reachX + NEAR_MISS_GAP) {
        t.nearMisses++
        events.nearMiss = true
      }
    }
    if (dx < reachX * HIT_SLACK && Math.abs(c.z) < reachZ * HIT_SLACK) {
      t.alive = false
      events.crash = true
    }
    if (c.z > DESPAWN_BEHIND || c.z < SPAWN_Z - 80) c.active = false
  }

  // Denser traffic as you go further; nothing spawns ahead while you sit still.
  t.nextSpawn -= Math.max(t.speed - 18, 0) * dt
  if (t.nextSpawn <= 0) {
    spawn(t, rand)
    const d = DIFFICULTIES[t.difficulty]
    t.nextSpawn = Math.max(d.spawnMin, d.spawn - t.distance * 0.003) * (0.6 + rand() * 0.8)
  }
  return events
}

/** Harder levels multiply the whole score. */
const trafficScore = (t: Traffic) =>
  Math.round((Math.floor(t.distance / 10) + t.passed * 5 + t.nearMisses * 25) * DIFFICULTIES[t.difficulty].multiplier)

export {
  LANES,
  LANE_WIDTH,
  EDGE,
  VEHICLES,
  PLAYER,
  DIFFICULTIES,
  GRIP,
  POOL,
  SPAWN_Z,
  createTraffic,
  populate,
  laneFree,
  stepTraffic,
  trafficScore,
}
export type { Traffic, Car, DriveInput, Difficulty, Weather, RunOptions }
