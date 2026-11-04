import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { Terrain } from '#/modules/games/adventure/components/world-kit/terrain'
import { Sea } from '#/modules/games/adventure/components/world-kit/sea'
import { FogBanks, SkyAndFog } from '#/modules/games/adventure/components/world-kit/sky-and-fog'
import { Grass, Rocks, Trees, Wind, scatter } from '#/modules/games/adventure/components/world-kit/foliage'
import { Areas, CheckpointZone } from '#/modules/games/adventure/components/zones'
import {
  FLATS,
  ISLAND_RADIUS,
  SITE_XZ,
  WORLD_SIZE,
  islandHeight,
} from '#/modules/games/adventure/worlds/forgotten-island/layout'
import { ALL_MATERIALS } from './materials'
import { Shore } from './shore'
import { Forest } from './forest'
import { Ruins } from './ruins'
import { Cliff } from './cliff'
import { Summit, Temple } from './temple'

const SAND = new THREE.Color('#e3cf9f')
const WET_SAND = new THREE.Color('#b79f74')
const GRASS = new THREE.Color('#7aa04c')
const DRY = new THREE.Color('#a7a05a')
const ROCK = new THREE.Color('#8f8576')
const tmp = new THREE.Color()

const terrainColor = (h: number, slope: number, x: number, z: number) => {
  if (h < 0.4) return tmp.copy(WET_SAND)
  if (h < 2.6) return tmp.copy(SAND).lerp(GRASS, THREE.MathUtils.smoothstep(h, 1.8, 2.6))
  // Drier, yellower grass up high and on the west; rock on steep slopes.
  const dry = THREE.MathUtils.smoothstep(h, 18, 34) * 0.7 + (x < -60 ? 0.3 : 0)
  tmp.copy(GRASS).lerp(DRY, Math.min(1, dry + Math.sin(x * 0.13 + z * 0.07) * 0.08))
  return tmp.lerp(ROCK, THREE.MathUtils.smoothstep(slope, 0.18, 0.32))
}

/** Keeps vegetation off sites, beaches and steep ground. */
const onLand =
  (minH: number, maxSlope = 1.2) =>
  (x: number, z: number) => {
    const h = islandHeight(x, z)
    if (h < minH) return null
    const slope = Math.abs(islandHeight(x + 1, z) - h) + Math.abs(islandHeight(x, z + 1) - h)
    if (slope > maxSlope) return null
    for (const f of FLATS) if (Math.hypot(x - f.x, z - f.z) < f.r + 3) return null
    return h - 0.1
  }

const AREAS = [
  { id: 'start', position: SITE_XZ.start, ambience: 'surf' as const },
  { id: 'shrine', position: SITE_XZ.shrine, ambience: 'surf' as const },
  { id: 'forest', position: [42, 55] as [number, number], ambience: 'forest' as const },
  { id: 'ruins', position: SITE_XZ.ruins, ambience: 'ruins' as const },
  { id: 'cliff', position: SITE_XZ.cliff, ambience: 'cliff' as const },
  { id: 'temple', position: SITE_XZ.temple, ambience: 'temple' as const },
  { id: 'summit', position: SITE_XZ.summit, ambience: 'summit' as const },
]

const FOG = '#c9d7d8'

const IslandScene = () => {
  const [plants] = useState(() => ({
    forest: scatter(11, 120, [45, 50], [0, 38], onLand(3, 0.9), [0.9, 1.5]),
    pines: scatter(23, 60, [-30, -40], [10, 70], onLand(10, 1), [0.9, 1.4]),
    palms: scatter(31, 18, [0, 90], [8, 50], onLand(1.5, 0.8), [0.8, 1.2]),
    grass: scatter(41, 700, [0, 10], [0, ISLAND_RADIUS * 0.85], onLand(2.4, 1.1), [0.7, 1.4]),
    rocks: scatter(53, 45, [0, 0], [20, ISLAND_RADIUS * 0.9], onLand(0.2, 2), [0.6, 2.2]),
  }))
  // Materials are module-level (shared); free their GPU copies when the island unmounts.
  useEffect(() => () => ALL_MATERIALS.forEach((m) => m.dispose()), [])
  return (
    <>
      <SkyAndFog sun={[80, 35, 60]} fog={FOG} density={0.0085} />
      <FogBanks
        color="#eef3f3"
        banks={[
          { position: [120, 3, 90], scale: 60 },
          { position: [-140, 4, 40], scale: 70 },
          { position: [-60, 6, -150], scale: 80 },
          { position: [110, 5, -110], scale: 70 },
          { position: [40, 16, 50], scale: 30 },
          { position: [-60, 26, -30], scale: 28 },
        ]}
      />
      <Terrain size={WORLD_SIZE} segments={170} height={islandHeight} color={terrainColor} />
      <Sea shoreRadius={ISLAND_RADIUS} />
      <Wind />
      <Trees kind="broadleaf" items={plants.forest} />
      <Trees kind="pine" items={plants.pines} />
      <Trees kind="palm" items={plants.palms} />
      <Grass items={plants.grass} />
      <Rocks items={plants.rocks} />
      <Shore />
      <Forest />
      <Ruins />
      <Cliff />
      <Temple />
      <Summit />
      <Areas areas={AREAS} />
      {['start', 'shrine', 'ruins', 'cliff', 'temple', 'summit'].map((id) => (
        <CheckpointZone key={id} id={id} size={[7, 5, 7]} />
      ))}
    </>
  )
}

export { IslandScene }
