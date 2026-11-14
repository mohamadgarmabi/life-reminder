import { describe, expect, it } from 'vitest'
import {
  EDGE,
  LANES,
  SPAWN_Z,
  createTraffic,
  laneFree,
  populate,
  stepTraffic,
  trafficScore,
  type Car,
  type DriveInput,
  type Traffic,
} from '#/modules/games/utils/traffic'

const car = (lane: number, z: number, speed = 20): Car => ({
  active: true,
  lane,
  targetLane: lane,
  x: LANES[lane],
  z,
  speed,
  cruise: speed,
  model: 0,
  passed: false,
})
const quiet = () => {
  const t = createTraffic()
  t.nextSpawn = 1e9
  return t
}
// rand = 0.99: no random lane changes, so tests are deterministic.
const drive = (t: Traffic, seconds: number, input: DriveInput = { steer: 0, brake: false }) => {
  for (let s = 0; s < seconds; s += 1 / 60) stepTraffic(t, input, 1 / 60, () => 0.99)
}

describe('traffic', () => {
  it('crashes into a slower car in its lane; overtakes one in the next lane with a near-miss bonus', () => {
    const hit = quiet()
    hit.cars[0] = car(2, -20, 10)
    drive(hit, 3)
    expect(hit.alive).toBe(false)

    const pass = quiet()
    pass.cars[0] = car(3, -20, 10)
    drive(pass, 3)
    expect(pass.alive).toBe(true)
    expect(pass.passed).toBe(1)
    expect(pass.nearMisses).toBe(0)

    // Squeezing past with under a metre to spare is a near miss.
    const close = quiet()
    close.cars[0] = car(3, -20, 10)
    close.x = LANES[3] - 2.5
    drive(close, 3)
    expect(close.alive).toBe(true)
    expect(close.nearMisses).toBe(1)
    expect(trafficScore(close)).toBeGreaterThanOrEqual(30)
  })

  it('steers smoothly out of the way and scrapes (slows) at the guardrail', () => {
    const t = quiet()
    t.cars[0] = car(2, -30, 10)
    drive(t, 0.8, { steer: -1, brake: false })
    expect(t.x).toBeLessThan(LANES[2] - 2)
    drive(t, 3)
    expect(t.alive).toBe(true)

    const edge = quiet()
    drive(edge, 1)
    const before = edge.speed
    drive(edge, 3, { steer: 1, brake: false })
    expect(edge.x).toBe(EDGE)
    expect(edge.speed).toBeLessThan(before)
  })

  it('brakes to a stop', () => {
    const t = quiet()
    drive(t, 4, { steer: 0, brake: true })
    expect(t.speed).toBe(0)
  })

  it('never changes lanes into a car or alongside the player', () => {
    const t = quiet()
    const a = car(0, -50)
    t.cars[0] = a
    t.cars[1] = car(1, -55)
    expect(laneFree(t, a, 1)).toBe(false)
    expect(laneFree(t, a, -1)).toBe(false)
    const beside = car(1, -5)
    t.x = LANES[2]
    expect(laneFree(t, beside, 2)).toBe(false)
    t.cars[1].active = false
    expect(laneFree(t, a, 1)).toBe(true)
  })

  it('keeps a lane open when spawning', () => {
    let seed = 7
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    const t = createTraffic()
    for (let i = 0; i < 60 * 60; i++) {
      stepTraffic(t, { steer: 0, brake: false }, 1 / 60, rand)
      t.alive = true
      const near = t.cars.filter((c) => c.active && Math.abs(c.z - SPAWN_Z) < 20)
      expect(new Set(near.map((c) => c.lane)).size).toBeLessThan(LANES.length)
    }
  })

  it('starts a run with traffic ahead, spaced out and never filling every lane at one spot', () => {
    let seed = 3
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    const t = createTraffic()
    populate(t, rand)
    const cars = t.cars.filter((c) => c.active)
    expect(cars.length).toBeGreaterThanOrEqual(3)
    expect(cars.every((c) => c.z <= -60)).toBe(true)
    for (const c of cars)
      expect(new Set(cars.filter((o) => Math.abs(o.z - c.z) < 25).map((o) => o.lane)).size).toBeLessThan(LANES.length)
  })

  it('scales with difficulty and loses grip in snow', () => {
    const run = (o: Parameters<typeof createTraffic>[0]) => {
      const t = createTraffic(o)
      t.nextSpawn = 1e9
      drive(t, 20)
      return t
    }
    expect(run({ difficulty: 'legendary' }).speed).toBeGreaterThan(run({ difficulty: 'easy' }).speed + 15)
    // A car never beats its own top speed, however hard the level.
    expect(run({ difficulty: 'legendary', vehicle: 4 }).speed * 3.6).toBeLessThanOrEqual(130.01)

    const dry = createTraffic()
    const snowy = createTraffic({ weather: 'snow' })
    for (const t of [dry, snowy]) {
      t.nextSpawn = 1e9
      drive(t, 0.5, { steer: -1, brake: false })
    }
    expect(LANES[2] - snowy.x).toBeLessThan((LANES[2] - dry.x) * 0.7)
  })

  it('collides using the chosen vehicle size', () => {
    // Truck + hatchback touch within 4.9 m between centres; two hatchbacks only within 3.8 m.
    const truck = quiet()
    Object.assign(truck, { vehicle: 4 })
    truck.cars[0] = car(2, -4.5, truck.speed)
    stepTraffic(truck, { steer: 0, brake: false }, 1 / 60, () => 0.99)
    expect(truck.alive).toBe(false)
    const hatch = quiet()
    hatch.cars[0] = car(2, -4.5, hatch.speed)
    stepTraffic(hatch, { steer: 0, brake: false }, 1 / 60, () => 0.99)
    expect(hatch.alive).toBe(true)
  })
})
