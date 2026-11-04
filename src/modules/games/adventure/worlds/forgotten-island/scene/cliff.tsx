import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { Interactable, Pickup } from '#/modules/games/adventure/components/interactable'
import { SecretZone, Zone } from '#/modules/games/adventure/components/zones'
import { usePuzzle, useTier } from '#/modules/games/adventure/hooks/world.hook'
import { useEngine, patchGame } from '#/modules/games/adventure/stores/session.store'
import { teleport } from '#/modules/games/adventure/stores/engine.actions'
import { playChime, playSfx } from '#/modules/games/adventure/utils/audio'
import { site } from '#/modules/games/adventure/worlds/forgotten-island/layout'
import { CHIME_SEQUENCE } from '#/modules/games/adventure/worlds/forgotten-island/puzzles'
import { GLYPHS, darkStone, feather, glyphStrip, stone, wood } from './materials'

const CHIMES = 5
const SHOW_STEP = 0.9
const SHOW_GAP = 2.6

type GlowMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>

/** Glyph plate material that can glow (lit by the wall sequence or a ring). */
const useGlyphMaterial = (index: number) => {
  const [m] = useState(
    () =>
      new THREE.MeshStandardMaterial({
        map: glyphStrip([GLYPHS[index]]),
        emissive: '#ffcc55',
        emissiveIntensity: 0,
        roughness: 1,
      }),
  )
  useEffect(
    () => () => {
      m.map?.dispose()
      m.dispose()
    },
    [m],
  )
  return m
}

/** Wall glyphs light up in the target order, on a loop: the puzzle works with sound off. */
const GlyphWall = ({ solved }: { solved: boolean }) => {
  const mats = [useGlyphMaterial(0), useGlyphMaterial(1), useGlyphMaterial(2), useGlyphMaterial(3), useGlyphMaterial(4)]
  const plates = useRef<(GlowMesh | null)[]>([])
  useFrame(({ clock }) => {
    const cycle = CHIME_SEQUENCE.length * SHOW_STEP + SHOW_GAP
    const t = clock.elapsedTime % cycle
    const step = Math.floor(t / SHOW_STEP)
    const lit = solved ? -1 : step < CHIME_SEQUENCE.length ? CHIME_SEQUENCE[step] : -1
    plates.current.forEach((plate, i) => {
      if (!plate) return
      const target = solved ? 0.8 : i === lit ? 2.2 : 0
      plate.material.emissiveIntensity += (target - plate.material.emissiveIntensity) * 0.25
    })
  })
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh material={darkStone} position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 3.2, 0.6]} />
      </mesh>
      {mats.map((m, i) => (
        <mesh
          key={i}
          ref={(el: GlowMesh | null) => {
            plates.current[i] = el
          }}
          material={m}
          position={[(i - 2) * 1.3, 1.9, 0.31]}
        >
          <planeGeometry args={[0.9, 0.9]} />
        </mesh>
      ))}
    </RigidBody>
  )
}

/** A hanging stone chime; it swings and glows when rung. */
const Chime = ({ index, onRing, enabled }: { index: number; onRing: () => void; enabled: boolean }) => {
  const mat = useGlyphMaterial(index)
  const body = useRef<THREE.Group>(null)
  const glyph = useRef<GlowMesh>(null)
  const rung = useRef(-1e9)
  useFrame(() => {
    const since = (performance.now() - rung.current) / 1000
    if (glyph.current) glyph.current.material.emissiveIntensity = Math.max(0, 2 - since * 3)
    if (body.current) body.current.rotation.x = Math.sin(since * 9) * Math.max(0, 0.35 - since * 0.2)
  })
  const ring = () => {
    rung.current = performance.now()
    playChime(index)
    onRing()
  }
  return (
    <Interactable
      id={`chime-${index}`}
      label="نواختن"
      enabled={enabled}
      onUse={ring}
      position={[(index - 2) * 1.6, 0, 0]}
      markerHeight={3.4}
      radius={2}
    >
      <group ref={body} position={[0, 2.9, 0]}>
        <mesh material={wood} position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
        </mesh>
        <mesh material={stone} position={[0, -1, 0]} castShadow>
          <boxGeometry args={[0.55, 1.1, 0.2]} />
        </mesh>
        <mesh ref={glyph} material={mat} position={[0, -1, 0.11]}>
          <planeGeometry args={[0.45, 0.45]} />
        </mesh>
      </group>
    </Interactable>
  )
}

/** Cliff temple: ring the chimes in the wall's order to open the sanctum and reach the Wind Feather. */
const Cliff = () => {
  const engine = useEngine()
  const tier = useTier()
  const [state, dispatch, solved] = usePuzzle<{ rung: number[] }, { ring: number }>('chimes')
  const door = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (door.current) door.current.position.y += (-1.8 - door.current.position.y) * Math.min(1, dt * 1.2)
  })
  const ring = (i: number) => {
    const next = dispatch({ ring: i })
    if (!solved && next.rung.length !== state.rung.length + 1) {
      playSfx('wrong')
      patchGame(engine.store, { notice: 'ترتیب زنگ‌ها اشتباه بود؛ از اول' })
    }
  }
  const [x, y, z] = site('cliff')
  // The temple faces east (towards the island's centre).
  return (
    <group position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
      {/* Sanctum: three walls, roof, door */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={stone} position={[-2.6, 1.8, -7]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 3.6, 5]} />
        </mesh>
        <mesh material={stone} position={[2.6, 1.8, -7]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 3.6, 5]} />
        </mesh>
        <mesh material={stone} position={[0, 1.8, -9.2]} castShadow receiveShadow>
          <boxGeometry args={[6, 3.6, 0.8]} />
        </mesh>
        <mesh material={darkStone} position={[0, 3.9, -7]} castShadow>
          <boxGeometry args={[6.8, 0.6, 5.8]} />
        </mesh>
        {[-3, 3].map((cx) => (
          <mesh key={cx} material={stone} position={[cx, 1.8, -4]} castShadow>
            <cylinderGeometry args={[0.35, 0.4, 3.6, 8]} />
          </mesh>
        ))}
      </RigidBody>
      {solved ? (
        <mesh ref={door} material={darkStone} position={[0, 1.6, -4.6]}>
          <boxGeometry args={[4.4, 3.2, 0.3]} />
        </mesh>
      ) : (
        <RigidBody type="fixed" colliders="cuboid">
          <mesh material={darkStone} position={[0, 1.6, -4.6]} castShadow>
            <boxGeometry args={[4.4, 3.2, 0.3]} />
          </mesh>
        </RigidBody>
      )}
      <Pickup itemId="wind-feather" position={[0, 1, -7.4]} enabled={solved} radius={2.8}>
        <mesh material={feather} rotation={[0.3, 0, 0.4]} castShadow>
          <coneGeometry args={[0.12, 0.9, 4, 1, true]} />
        </mesh>
        {solved && <pointLight color="#dfe9ff" intensity={4} distance={6} />}
      </Pickup>
      <mesh material={stone} position={[0, 0.45, -7.4]}>
        <boxGeometry args={[0.8, 0.9, 0.8]} />
      </mesh>

      {/* Chime frame in the courtyard */}
      <RigidBody type="fixed" colliders="cuboid">
        {[-4.6, 4.6].map((cx) => (
          <mesh key={cx} material={wood} position={[cx, 1.6, 1]} castShadow>
            <boxGeometry args={[0.3, 3.2, 0.3]} />
          </mesh>
        ))}
        <mesh material={wood} position={[0, 3.2, 1]} castShadow>
          <boxGeometry args={[9.5, 0.3, 0.3]} />
        </mesh>
      </RigidBody>
      <group position={[0, 0, 1]}>
        {Array.from({ length: CHIMES }, (_, i) => (
          <Chime key={i} index={i} enabled={!solved} onRing={() => ring(i)} />
        ))}
      </group>
      <group position={[0, 0, -2.2]}>
        <GlyphWall solved={solved} />
      </group>

      <Sparkles
        count={tier === 'high' ? 80 : 25}
        scale={[20, 4, 6]}
        position={[0, 1, 12]}
        size={5}
        speed={1.2}
        color="#f2fbff"
      />
      <Shortcut />
    </group>
  )
}

/** Hidden arch behind bushes on the courtyard's edge: a keepers' passage straight to the central temple. */
const Shortcut = () => {
  const engine = useEngine()
  const exit = site('temple', -16, 14, 1.2)
  return (
    <group position={[8.5, 0, 6]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={stone} position={[-1, 1.2, 0]} castShadow>
          <boxGeometry args={[0.5, 2.4, 0.5]} />
        </mesh>
        <mesh material={stone} position={[1, 1.2, 0]} castShadow>
          <boxGeometry args={[0.5, 2.4, 0.5]} />
        </mesh>
        <mesh material={stone} position={[0, 2.6, 0]} castShadow>
          <boxGeometry args={[2.6, 0.5, 0.6]} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 1.1, -0.05]}>
        <planeGeometry args={[1.5, 2.2]} />
        <meshBasicMaterial color="#0d0a08" />
      </mesh>
      <Pickup itemId="journal-6" position={[1.6, 0, 1]} />
      <ArchTrigger onEnter={() => teleport(engine, exit, 0)} />
    </group>
  )
}

/** Secret + teleport trigger inside the arch. Zones take world coordinates, so the arch's are computed here. */
const ArchTrigger = ({ onEnter }: { onEnter: () => void }) => {
  const [x, y, z] = site('cliff')
  // Local (8.5, 6) under the cliff group's +90° turn about y: (lx, lz) → (lz, −lx).
  const position: [number, number, number] = [x + 6, y + 1, z - 8.5]
  return (
    <>
      <SecretZone id="cliff-shortcut" position={position} size={[0.8, 1.5, 0.8]} />
      <Zone position={position} size={[0.8, 1.5, 0.8]} onEnter={onEnter} />
    </>
  )
}

export { Cliff }
