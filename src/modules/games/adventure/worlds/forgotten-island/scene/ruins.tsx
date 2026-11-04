import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { Interactable, Pickup } from '#/modules/games/adventure/components/interactable'
import { usePuzzle } from '#/modules/games/adventure/hooks/world.hook'
import { useEngine, patchGame } from '#/modules/games/adventure/stores/session.store'
import { playSfx } from '#/modules/games/adventure/utils/audio'
import { site } from '#/modules/games/adventure/worlds/forgotten-island/layout'
import { GLYPHS, darkStone, glyphStrip, metal, mossStone, shell, stone, water } from './materials'

const HALF = 7
const WALL_H = 3

type Wall = { pos: [number, number, number]; size: [number, number, number] }

// Courtyard walls with a gate gap on the west side (−x), broken tops for the ruined look.
const WALLS: Wall[] = [
  { pos: [0, WALL_H / 2, -HALF], size: [HALF * 2 + 1, WALL_H, 1] },
  { pos: [0, WALL_H / 2 - 0.4, HALF], size: [HALF * 2 + 1, WALL_H - 0.8, 1] },
  { pos: [HALF, WALL_H / 2, 0], size: [1, WALL_H, HALF * 2] },
  { pos: [-HALF, WALL_H / 2, -4.5], size: [1, WALL_H, 5] },
  { pos: [-HALF, WALL_H / 2 - 0.6, 4.5], size: [1, WALL_H - 1.2, 5] },
]

/** A sluice wheel with its glyph plate; turns when opened, flashes red on a wrong order. */
const Sluice = ({
  index,
  open,
  onOpen,
  wrongCount,
}: {
  index: number
  open: boolean
  onOpen: () => void
  wrongCount: number
}) => {
  const wheel = useRef<THREE.Mesh>(null)
  const [plate] = useState(() => new THREE.MeshStandardMaterial({ map: glyphStrip([GLYPHS[index]]), roughness: 1 }))
  const [wheelMat] = useState(() => metal.clone())
  useEffect(
    () => () => {
      plate.map?.dispose()
      plate.dispose()
      wheelMat.dispose()
    },
    [plate, wheelMat],
  )
  const flashFrom = useRef(-1e9)
  useEffect(() => {
    if (wrongCount) flashFrom.current = performance.now()
  }, [wrongCount])
  useFrame((_, dt) => {
    if (wheel.current)
      wheel.current.rotation.z += ((open ? Math.PI * 2 : 0) - wheel.current.rotation.z) * Math.min(1, dt * 3)
    const flash = Math.max(0, 1 - (performance.now() - flashFrom.current) / 900)
    wheelMat.emissive.setRGB(flash * 0.9, 0, 0)
  })
  return (
    <Interactable
      id={`sluice-${index}`}
      label="باز کردن دریچه"
      enabled={!open}
      onUse={onOpen}
      position={[-HALF - 1.2, 0, -5 + index * 1.6]}
      markerHeight={2.3}
    >
      <mesh material={plate} position={[0.7, 1.9, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.7, 0.7]} />
      </mesh>
      <mesh ref={wheel} material={wheelMat} position={[0.2, 1.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.4, 0.06, 6, 12]} />
      </mesh>
      <mesh material={darkStone} position={[0.5, 0.6, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
      </mesh>
    </Interactable>
  )
}

/** Flooded ruins: open the sluices in the journal's order to drain the courtyard and reach the Tide Shell. */
const Ruins = () => {
  const { store } = useEngine()
  const [state, dispatch, solved] = usePuzzle<{ opened: number[] }, { open: number }>('sluices')
  const [wrongCount, setWrongCount] = useState(0)
  const waterRef = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (waterRef.current) {
      const target = solved ? -0.6 : 1.2
      waterRef.current.position.y += (target - waterRef.current.position.y) * Math.min(1, dt * 0.6)
    }
  })
  const open = (i: number) => {
    const next = dispatch({ open: i })
    if (next.opened.length !== state.opened.length + 1) {
      setWrongCount((n) => n + 1)
      playSfx('wrong')
      patchGame(store, { notice: 'دریچه‌ها دوباره بسته شدند' })
    } else {
      playSfx('water')
    }
  }
  const [x, y, z] = site('ruins')
  return (
    <group position={[x, y, z]}>
      <RigidBody type="fixed" colliders="cuboid">
        {WALLS.map((w, i) => (
          <mesh key={i} material={i % 2 ? mossStone : stone} position={w.pos} castShadow receiveShadow>
            <boxGeometry args={w.size} />
          </mesh>
        ))}
        {/* Fallen column inside */}
        <mesh material={stone} position={[3.5, 0.5, 3.5]} rotation={[0, 0.6, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 4, 8]} />
        </mesh>
        <mesh material={stone} position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.2, 1, 1.2]} />
        </mesh>
      </RigidBody>
      {/* Water blocks the gate until drained */}
      {!solved && (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[0.5, 2, 2]} position={[-HALF, 2, 0]} />
        </RigidBody>
      )}
      <mesh ref={waterRef} material={water} position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALF * 2 - 1, HALF * 2 - 1]} />
      </mesh>
      <Pickup itemId="tide-shell" position={[0, 1.1, 0]} enabled={solved} radius={2.6}>
        <mesh material={shell} scale={[1, 0.7, 1]} castShadow>
          <coneGeometry args={[0.3, 0.5, 9]} />
        </mesh>
        <pointLight color="#8fe7ff" intensity={solved ? 4 : 1.5} distance={6} />
      </Pickup>
      {state &&
        [0, 1, 2, 3].map((i) => (
          <Sluice
            key={i}
            index={i}
            open={solved || state.opened.includes(i)}
            onOpen={() => open(i)}
            wrongCount={wrongCount}
          />
        ))}
      <Pickup itemId="journal-3" position={[-HALF - 1.6, 0, 3.5]} />
    </group>
  )
}

export { Ruins }
