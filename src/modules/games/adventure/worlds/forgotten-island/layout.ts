import { applyFlats, fbm, smoothstep, type Flat } from '#/modules/games/adventure/utils/terrain'

// World units are metres. Sea level is y = 0; the summit peak sits north of the centre.
const SEED = 7
const WORLD_SIZE = 340
const ISLAND_RADIUS = 150
const PEAK = { x: 10, z: -62, h: 34 }
const CLIFF_BUMP = { x: -100, z: -35, h: 14, r: 25 }
/** Below this the player is in deep water and respawns. */
const KILL_Y = -1.4

type Site = 'start' | 'shrine' | 'ruins' | 'cliff' | 'temple' | 'summit'

const SITE_XZ: Record<Site, [number, number]> = {
  start: [0, 105],
  shrine: [-82, 70],
  ruins: [85, 25],
  cliff: [-98, -35],
  temple: [0, 10],
  summit: [10, -62],
}

const FLAT_RADIUS: Record<Site, number> = { start: 9, shrine: 12, ruins: 16, cliff: 13, temple: 14, summit: 9 }

const raw = (x: number, z: number) => {
  const r = Math.hypot(x, z)
  const angle = Math.atan2(z, x)
  // Wobbly coastline: the mask fades land into sea floor.
  const coast = ISLAND_RADIUS * (1 + 0.1 * fbm(Math.cos(angle) * 2 + 3, Math.sin(angle) * 2 + 3, SEED))
  const land = 1 - smoothstep(coast * 0.74, coast, r)
  const dPeak = Math.hypot(x - PEAK.x, z - PEAK.z)
  const dCliff = Math.hypot(x - CLIFF_BUMP.x, z - CLIFF_BUMP.z)
  const dome = PEAK.h * Math.exp(-(dPeak * dPeak) / (2 * 70 * 70))
  const bump = CLIFF_BUMP.h * Math.exp(-(dCliff * dCliff) / (2 * CLIFF_BUMP.r * CLIFF_BUMP.r))
  const detail = 2.4 * fbm(x / 55, z / 55, SEED)
  return (3 + dome + bump + detail) * land - 7 * (1 - land)
}

const FLATS: Flat[] = (Object.keys(SITE_XZ) as Site[]).map((site) => {
  const [x, z] = SITE_XZ[site]
  return { x, z, r: FLAT_RADIUS[site], h: raw(x, z) }
})

const islandHeight = (x: number, z: number) => applyFlats(raw(x, z), x, z, FLATS)

const site = (s: Site, dx = 0, dz = 0, lift = 0): [number, number, number] => {
  const [x, z] = SITE_XZ[s]
  return [x + dx, islandHeight(x + dx, z + dz) + lift, z + dz]
}

/** Ground point at any x/z, lifted by `lift`. */
const ground = (x: number, z: number, lift = 0): [number, number, number] => [x, islandHeight(x, z) + lift, z]

export { SEED, WORLD_SIZE, ISLAND_RADIUS, KILL_Y, SITE_XZ, FLATS, islandHeight, site, ground }
export type { Site }
