import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEngine, useRuntimeRef, patchGame, updateSession } from '#/modules/games/adventure/stores/session.store'
import { isObjectiveUnlocked, reachCheckpoint, recordSecret } from '#/modules/games/adventure/utils/session'
import { playEndingMusic, playSfx, setAmbience, type Ambience } from '#/modules/games/adventure/utils/audio'
import type { Vec3 } from '#/modules/games/adventure/types'

type ZoneProps = {
  position: Vec3
  /** Half extents of the box. */
  size: Vec3
  onEnter: () => void
}

/** Box trigger tested against the player each frame; fires once per entry. */
const Zone = ({ position, size, onEnter }: ZoneProps) => {
  const runtimeRef = useRuntimeRef()
  const inside = useRef(false)
  useFrame(() => {
    const p = runtimeRef.current.player.position
    const now =
      Math.abs(p.x - position[0]) < size[0] &&
      Math.abs(p.y - position[1]) < size[1] &&
      Math.abs(p.z - position[2]) < size[2]
    if (now && !inside.current) onEnter()
    inside.current = now
  })
  return null
}

const CheckpointZone = ({ id, size = [5, 4, 5] }: { id: string; size?: Vec3 }) => {
  const { world, store } = useEngine()
  return (
    <Zone
      position={world.checkpoints[id].position}
      size={size}
      onEnter={() => updateSession(store, (s) => reachCheckpoint(s, id))}
    />
  )
}

const SecretZone = ({ id, position, size = [2, 3, 2] }: { id: string; position: Vec3; size?: Vec3 }) => {
  const { store } = useEngine()
  return (
    <Zone
      position={position}
      size={size}
      onEnter={() => {
        if (store.state.session.secrets.includes(id)) return
        updateSession(store, (s) => recordSecret(s, id))
        patchGame(store, { notice: 'یک راز پیدا کردی!' })
        playSfx('right')
      }}
    />
  )
}

/** Starts the ending once the objective's puzzles are solved and the player arrives. */
const ObjectiveZone = ({ position, size = [2.5, 3, 2.5] }: { position: Vec3; size?: Vec3 }) => {
  const { world, store } = useEngine()
  const runtimeRef = useRuntimeRef()
  return (
    <Zone
      position={position}
      size={size}
      onEnter={() => {
        const g = store.state
        if (g.phase !== 'playing' || g.session.completed || !isObjectiveUnlocked(g.session, world)) return
        const runtime = runtimeRef.current
        runtime.endingAt = new THREE.Vector3(...position)
        runtime.input.move.x = runtime.input.move.y = 0
        patchGame(store, { phase: 'ending', nearby: null })
        playEndingMusic()
      }}
    />
  )
}

type Area = { id: string; position: [number, number]; ambience: Ambience }

/** The nearest area centre decides the ambience and the hint shown in the pause menu. */
const Areas = ({ areas }: { areas: Area[] }) => {
  const { store } = useEngine()
  const runtimeRef = useRuntimeRef()
  const acc = useRef(1)
  useFrame((_, dt) => {
    acc.current += dt
    if (acc.current < 0.5) return
    acc.current = 0
    const p = runtimeRef.current.player.position
    let best = areas[0]
    let bestD = Infinity
    for (const a of areas) {
      const d = Math.hypot(a.position[0] - p.x, a.position[1] - p.z)
      if (d < bestD) {
        best = a
        bestD = d
      }
    }
    setAmbience(best.ambience)
    if (store.state.area !== best.id) patchGame(store, { area: best.id })
  })
  return null
}

export { Zone, CheckpointZone, SecretZone, ObjectiveZone, Areas }
