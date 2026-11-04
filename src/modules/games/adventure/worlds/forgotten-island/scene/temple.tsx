import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { Interactable } from '#/modules/games/adventure/components/interactable'
import { ObjectiveZone } from '#/modules/games/adventure/components/zones'
import { useCompleted, usePuzzle, useTier } from '#/modules/games/adventure/hooks/world.hook'
import { useEngine, useGame, patchGame } from '#/modules/games/adventure/stores/session.store'
import { toFaDigits } from '#/modules/shell/utils/format'
import { site } from '#/modules/games/adventure/worlds/forgotten-island/layout'
import { ARTIFACTS } from '#/modules/games/adventure/worlds/forgotten-island/puzzles'
import { darkStone, ember, feather, gold, mossStone, shell, stone } from './materials'

const SLOT_MATERIAL = [gold, shell, feather]

/** Central temple: a ring of columns around the altar of three artifacts. */
const Temple = () => {
  const { world, store } = useEngine()
  const [state, dispatch, solved] = usePuzzle<{ slots: boolean[] }, 'place'>('altar')
  const holding = useGame(
    (g) =>
      ARTIFACTS.filter(
        (a, i) => g.session.inventory.includes(a) && !(g.session.puzzles.altar as { slots: boolean[] }).slots[i],
      ).length,
  )
  const place = () => {
    const next = dispatch('place')
    if (next.slots.every(Boolean)) {
      patchGame(store, { notice: 'زمین لرزید… دروازهٔ قله باز شد' })
      return
    }
    const missing = ARTIFACTS.filter((_, i) => !next.slots[i]).map((a) => world.items[a].name)
    patchGame(store, { notice: `${toFaDigits(3 - missing.length)} از ۳ — ${missing.join('، ')} کم است` })
  }
  const [x, y, z] = site('temple')
  return (
    <group position={[x, y, z]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={stone} position={[0, 0.2, 0]} receiveShadow>
          <cylinderGeometry args={[10, 10.6, 0.4, 16]} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8
          const broken = i === 2 || i === 5
          return (
            <mesh
              key={i}
              material={i % 3 ? stone : mossStone}
              position={[Math.sin(a) * 8, broken ? 1.6 : 2.6, Math.cos(a) * 8]}
              castShadow
            >
              <cylinderGeometry args={[0.5, 0.55, broken ? 2.8 : 4.8, 8]} />
            </mesh>
          )
        })}
      </RigidBody>
      {/* Altar */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={darkStone} position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[3, 1, 1.4]} />
        </mesh>
      </RigidBody>
      <Interactable
        id="altar"
        label={holding ? 'گذاشتن یادگارها' : 'محراب'}
        enabled={!solved}
        onUse={place}
        position={[0, 0.4, 0]}
        radius={3}
        markerHeight={2.4}
      >
        {state.slots.map((filled, i) => (
          <group key={i} position={[(i - 1) * 0.95, 1.5, 0]}>
            <mesh material={stone}>
              <cylinderGeometry args={[0.3, 0.36, 0.2, 10]} />
            </mesh>
            {filled && (
              <mesh material={SLOT_MATERIAL[i]} position={[0, 0.35, 0]} castShadow>
                {i === 0 ? (
                  <cylinderGeometry args={[0.3, 0.3, 0.05, 20]} />
                ) : i === 1 ? (
                  <coneGeometry args={[0.25, 0.42, 9]} />
                ) : (
                  <coneGeometry args={[0.1, 0.8, 4, 1, true]} />
                )}
              </mesh>
            )}
          </group>
        ))}
      </Interactable>
      {solved && <pointLight position={[0, 3, 0]} color="#ffd27a" intensity={6} distance={14} />}
    </group>
  )
}

const RING_R = 11
const GAP = 0.32 // radians either side of the gate (facing +z, towards the temple)

/** Summit: a ring wall with one gate, opened by the altar, around the dark beacon. */
const Summit = () => {
  const tier = useTier()
  const [, , altarSolved] = usePuzzle('altar')
  const lit = useCompleted()
  const gate = useRef<THREE.Mesh>(null)
  const flame = useRef<THREE.Mesh>(null)
  useFrame(({ clock }, dt) => {
    if (gate.current) gate.current.position.y += (-2.2 - gate.current.position.y) * Math.min(1, dt * 0.8)
    if (flame.current) flame.current.scale.y = 1 + Math.sin(clock.elapsedTime * 9) * 0.12
  })
  const [x, y, z] = site('summit')
  const blocks = 22
  return (
    <group position={[x, y, z]}>
      <RigidBody type="fixed" colliders="cuboid">
        {Array.from({ length: blocks }, (_, i) => {
          const a = (i / blocks) * Math.PI * 2
          if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < GAP) return null
          return (
            <mesh
              key={i}
              material={i % 4 ? stone : mossStone}
              position={[Math.sin(a) * RING_R, 1.7, Math.cos(a) * RING_R]}
              rotation={[0, a, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[3.3, 3.4 + (i % 3) * 0.4, 1]} />
            </mesh>
          )
        })}
        {/* Beacon tower */}
        <mesh material={stone} position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[1.6, 2, 3, 10]} />
        </mesh>
        <mesh material={darkStone} position={[0, 3.3, 0]} castShadow>
          <cylinderGeometry args={[1.4, 0.9, 0.7, 12]} />
        </mesh>
      </RigidBody>
      {altarSolved ? (
        <mesh ref={gate} material={darkStone} position={[0, 1.7, RING_R]}>
          <boxGeometry args={[3.4, 3.4, 0.6]} />
        </mesh>
      ) : (
        <RigidBody type="fixed" colliders="cuboid">
          <mesh material={darkStone} position={[0, 1.7, RING_R]} castShadow>
            <boxGeometry args={[3.4, 3.4, 0.6]} />
          </mesh>
        </RigidBody>
      )}
      {lit && (
        <>
          <mesh ref={flame} material={ember} position={[0, 4.4, 0]}>
            <coneGeometry args={[0.9, 2.2, 10]} />
          </mesh>
          <pointLight position={[0, 5, 0]} color="#ffb347" intensity={40} distance={60} decay={1.6} />
          <mesh position={[0, 40, 0]}>
            <cylinderGeometry args={[0.6, 1.6, 70, 12, 1, true]} />
            <meshBasicMaterial
              color="#ffd27a"
              transparent
              opacity={0.18}
              depthWrite={false}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Sparkles
            count={tier === 'high' ? 120 : 40}
            scale={[4, 8, 4]}
            position={[0, 6, 0]}
            size={7}
            speed={1.5}
            color="#ffcf70"
          />
        </>
      )}
      <ObjectiveZone position={[x, y + 1, z]} size={[3.5, 3, 3.5]} />
    </group>
  )
}

export { Temple, Summit }
