import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { Interactable, Pickup } from '#/modules/games/adventure/components/interactable'
import { usePuzzle, useSecretFound } from '#/modules/games/adventure/hooks/world.hook'
import { useEngine, patchGame, updateSession } from '#/modules/games/adventure/stores/session.store'
import { recordSecret } from '#/modules/games/adventure/utils/session'
import { playSfx } from '#/modules/games/adventure/utils/audio'
import { ground, site } from '#/modules/games/adventure/worlds/forgotten-island/layout'
import { GLYPHS, canvasCloth, darkStone, gold, glyphStrip, oldWood, stone, wood } from './materials'
import { PILLAR_CODE } from '#/modules/games/adventure/worlds/forgotten-island/puzzles'

/** Abandoned keepers' camp at the landing beach: tent, crates, a cold fire ring and the cellar hatch. */
const Camp = () => {
  const { store } = useEngine()
  const opened = useSecretFound('buried-cellar')
  const [x, y, z] = site('start', 6, -4)
  const openHatch = () => {
    updateSession(store, (s) => recordSecret(s, 'buried-cellar'))
    patchGame(store, { notice: 'یک راز پیدا کردی: سرداب زیر اردوگاه!' })
    playSfx('open')
  }
  return (
    <group position={[x, y, z]}>
      <RigidBody type="fixed" colliders="hull">
        <mesh material={canvasCloth} position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[2, 2.2, 4, 1, true]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={wood} position={[3, 0.35, 1]} rotation={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.8, 0.7, 0.8]} />
        </mesh>
        <mesh material={oldWood} position={[3.6, 0.3, 2]} rotation={[0, -0.3, 0.1]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
        </mesh>
        <mesh material={oldWood} position={[-3, 0.25, 2.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.2, 8]} />
        </mesh>
      </RigidBody>
      {/* Cold fire ring */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} material={darkStone} position={[Math.cos(i * 0.785) * 0.7, 0.1, 4 + Math.sin(i * 0.785) * 0.7]}>
          <dodecahedronGeometry args={[0.18, 0]} />
        </mesh>
      ))}
      <Pickup itemId="journal-1" position={[1.2, 0, 4.2]} />
      {/* Cellar hatch, half hidden under the tent flap */}
      <Interactable
        id="cellar-hatch"
        label="باز کردن دریچه"
        enabled={!opened}
        onUse={openHatch}
        position={[-1.8, 0.05, -2.2]}
      >
        <mesh
          material={oldWood}
          position={[0, opened ? 0.5 : 0.04, opened ? -0.5 : 0]}
          rotation={[opened ? -1.3 : 0, 0, 0]}
        >
          <boxGeometry args={[1.1, 0.08, 1.1]} />
        </mesh>
        {opened && (
          <mesh material={darkStone} position={[0, -0.02, 0]}>
            <boxGeometry args={[1, 0.02, 1]} />
          </mesh>
        )}
      </Interactable>
      {opened && <Pickup itemId="journal-5" position={[-1.8, 0.05, -2.2]} />}
    </group>
  )
}

/** A broken boat on the sand: environmental storytelling for the keepers' departure. */
const Wreck = () => {
  const [x, y, z] = ground(-14, 112)
  return (
    <RigidBody type="fixed" colliders="hull" position={[x, y - 0.3, z]} rotation={[0.15, 0.9, 0.25]}>
      <mesh material={oldWood} scale={[1, 0.6, 2.6]} castShadow>
        <sphereGeometry args={[1.6, 8, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>
      <mesh material={wood} position={[0.3, 1.2, -0.6]} rotation={[0.3, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 3.2, 6]} />
      </mesh>
    </RigidBody>
  )
}

const PILLAR_HEIGHT = 2.4
const STEP = Math.PI / 3

/** One hexagonal pillar; the face pointing at the player (local +z) shows glyph r. */
const Pillar = ({
  index,
  rotation,
  texture,
  onTurn,
  solved,
}: {
  index: number
  rotation: number
  texture: THREE.Texture
  onTurn: () => void
  solved: boolean
}) => {
  const mesh = useRef<THREE.Mesh>(null)
  const [material] = useState(
    () => new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95, flatShading: true }),
  )
  useEffect(() => () => material.dispose(), [material])
  // Face k is centred at angle (k + 0.5) * 60°; rotate by −that to bring it to the front.
  const target = -(rotation + 0.5) * STEP
  useFrame((_, dt) => {
    if (!mesh.current) return
    const cur = mesh.current.rotation.y
    let diff = target - cur
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    mesh.current.rotation.y = cur + diff * Math.min(1, dt * 6)
  })
  return (
    <Interactable
      id={`pillar-${index}`}
      label="چرخاندن"
      enabled={!solved}
      onUse={onTurn}
      position={[(index - 1) * 2.2, 0, 0]}
      markerHeight={PILLAR_HEIGHT + 0.6}
    >
      <RigidBody type="fixed" colliders="hull">
        <mesh ref={mesh} material={material} position={[0, PILLAR_HEIGHT / 2, 0]} rotation={[0, target, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.6, PILLAR_HEIGHT, 6]} />
        </mesh>
      </RigidBody>
      <mesh material={darkStone} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.75, 0.8, 0.2, 6]} />
      </mesh>
    </Interactable>
  )
}

/** Shore shrine: three pillars must match the mural; then the door slides down and the Sun Disc appears. */
const Shrine = () => {
  const [state, dispatch, solved] = usePuzzle<{ r: number[] }, { turn: number }>('pillars')
  const [pillarTex] = useState(() => {
    const t = glyphStrip(GLYPHS)
    t.wrapS = THREE.RepeatWrapping
    return t
  })
  const [muralTex] = useState(() =>
    glyphStrip(
      PILLAR_CODE.map((i) => GLYPHS[i]),
      128,
      '#a88f66',
      '#3a2a18',
    ),
  )
  useEffect(
    () => () => {
      pillarTex.dispose()
      muralTex.dispose()
    },
    [pillarTex, muralTex],
  )
  const door = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (door.current) door.current.position.y += (-1.6 - door.current.position.y) * Math.min(1, dt * 1.5)
  })
  const [x, y, z] = site('shrine')
  return (
    <group position={[x, y, z]} rotation={[0, 0.6, 0]}>
      {/* Shrine house behind the pillars */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={stone} position={[-2.1, 1.6, -6]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 3.2, 3]} />
        </mesh>
        <mesh material={stone} position={[2.1, 1.6, -6]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 3.2, 3]} />
        </mesh>
        <mesh material={stone} position={[0, 1.6, -7.2]} castShadow receiveShadow>
          <boxGeometry args={[3, 3.2, 0.6]} />
        </mesh>
        <mesh material={darkStone} position={[0, 3.45, -6]} castShadow>
          <boxGeometry args={[5.6, 0.5, 3.6]} />
        </mesh>
      </RigidBody>
      {/* Closed: a solid door. Solved: the collider goes and the slab sinks into the ground. */}
      {solved ? (
        <mesh ref={door} material={darkStone} position={[0, 1.4, -4.7]}>
          <boxGeometry args={[3, 2.8, 0.3]} />
        </mesh>
      ) : (
        <RigidBody type="fixed" colliders="cuboid">
          <mesh material={darkStone} position={[0, 1.4, -4.7]} castShadow>
            <boxGeometry args={[3, 2.8, 0.3]} />
          </mesh>
        </RigidBody>
      )}
      <Pickup itemId="sun-disc" position={[0, 0.9, -6]} enabled={solved} radius={2.6}>
        <mesh material={gold} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.06, 20]} />
        </mesh>
        {solved && <pointLight color="#ffcf70" intensity={4} distance={6} />}
      </Pickup>
      <mesh material={stone} position={[0, 0.4, -6]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
      </mesh>
      {/* Pillars, facing the approach (+z) */}
      <group position={[0, 0, -1]}>
        {state.r.map((r, i) => (
          <Pillar
            key={i}
            index={i}
            rotation={r}
            texture={pillarTex}
            solved={solved}
            onTurn={() => {
              playSfx('stone')
              dispatch({ turn: i })
            }}
          />
        ))}
      </group>
      {/* Mural slab to the side, showing the code */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[5.2, 1.3, -1.6]} rotation={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[3.4, 1.3, 0.25]} />
          <meshStandardMaterial attach="material-4" map={muralTex} roughness={1} />
          <meshStandardMaterial attach="material-0" color="#a88f66" roughness={1} />
          <meshStandardMaterial attach="material-1" color="#a88f66" roughness={1} />
          <meshStandardMaterial attach="material-2" color="#a88f66" roughness={1} />
          <meshStandardMaterial attach="material-3" color="#a88f66" roughness={1} />
          <meshStandardMaterial attach="material-5" color="#a88f66" roughness={1} />
        </mesh>
      </RigidBody>
    </group>
  )
}

const Shore = () => (
  <>
    <Camp />
    <Wreck />
    <Shrine />
  </>
)

export { Shore }
