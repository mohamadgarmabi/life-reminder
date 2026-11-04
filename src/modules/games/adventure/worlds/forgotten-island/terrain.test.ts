import { describe, expect, it } from 'vitest'
import {
  ISLAND_RADIUS,
  SITE_XZ,
  islandHeight,
  type Site,
} from '#/modules/games/adventure/worlds/forgotten-island/layout'

const routes: [Site, Site][] = [
  ['start', 'shrine'],
  ['start', 'temple'],
  ['start', 'ruins'],
  ['temple', 'ruins'],
  ['temple', 'cliff'],
  ['temple', 'summit'],
  ['shrine', 'cliff'],
]

describe('island terrain', () => {
  it('is deterministic', () => {
    expect(islandHeight(12.3, -40.1)).toBe(islandHeight(12.3, -40.1))
  })

  it('every site is dry land', () => {
    for (const [x, z] of Object.values(SITE_XZ)) expect(islandHeight(x, z)).toBeGreaterThan(1)
  })

  it('is sea floor beyond the island', () => {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8)
      expect(islandHeight(Math.cos(a) * (ISLAND_RADIUS + 25), Math.sin(a) * (ISLAND_RADIUS + 25))).toBeLessThan(-1.4)
  })

  it('straight routes between sites stay dry and walkable (< 40° slope)', () => {
    for (const [a, b] of routes) {
      const [ax, az] = SITE_XZ[a]
      const [bx, bz] = SITE_XZ[b]
      const steps = Math.ceil(Math.hypot(bx - ax, bz - az) / 2)
      let prev = islandHeight(ax, az)
      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        const h = islandHeight(ax + (bx - ax) * t, az + (bz - az) * t)
        const run = Math.hypot(bx - ax, bz - az) / steps
        expect(h, `${a}→${b} dips into the sea`).toBeGreaterThan(-0.5)
        expect(Math.atan(Math.abs(h - prev) / run), `${a}→${b} too steep`).toBeLessThan((40 * Math.PI) / 180)
        prev = h
      }
    }
  })
})
