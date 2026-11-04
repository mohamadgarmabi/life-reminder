import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { Pickup } from '#/modules/games/adventure/components/interactable'
import { SecretZone } from '#/modules/games/adventure/components/zones'
import { useTier } from '#/modules/games/adventure/hooks/world.hook'
import { ground } from '#/modules/games/adventure/worlds/forgotten-island/layout'
import { canvasTexture, mossStone, darkStone } from './materials'

const FALL: [number, number] = [52, 72]

/** Waterfall over a rock face; walking through it leads into a hidden cave. */
const Waterfall = () => {
  const tier = useTier()
  const [x, y, z] = ground(...FALL)
  const [material] = useState(() => {
    const map = canvasTexture(64, 256, (ctx) => {
      ctx.fillStyle = 'rgba(200,235,240,0.35)'
      ctx.fillRect(0, 0, 64, 256)
      for (let i = 0; i < 70; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.5})`
        ctx.fillRect(Math.random() * 64, Math.random() * 256, 1 + Math.random() * 2, 20 + Math.random() * 60)
      }
    })
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.repeat.set(2, 1)
    return new THREE.MeshStandardMaterial({
      map,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: 0.1,
    })
  })
  useEffect(
    () => () => {
      material.map?.dispose()
      material.dispose()
    },
    [material],
  )
  const curtain = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>>(null)
  useFrame((_, dt) => {
    const map = curtain.current?.material.map
    if (map) map.offset.y += dt * 1.2
  })
  return (
    <group position={[x, y, z]} rotation={[0, -0.5, 0]}>
      {/* Rock face with a cave hollow behind the curtain of water */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh material={mossStone} position={[-4, 4, -1]} castShadow receiveShadow>
          <boxGeometry args={[5, 8, 5]} />
        </mesh>
        <mesh material={mossStone} position={[4, 4, -1]} castShadow receiveShadow>
          <boxGeometry args={[5, 8, 5]} />
        </mesh>
        <mesh material={mossStone} position={[0, 6, -1]} castShadow>
          <boxGeometry args={[3.2, 4, 5]} />
        </mesh>
        <mesh material={darkStone} position={[0, 2, -4.2]}>
          <boxGeometry args={[3.2, 4, 1]} />
        </mesh>
      </RigidBody>
      <mesh ref={curtain} material={material} position={[0, 2.6, 1.55]}>
        <planeGeometry args={[3.1, 5.6]} />
      </mesh>
      <Sparkles
        count={tier === 'high' ? 40 : 15}
        scale={[3, 1, 1.5]}
        position={[0, 0.4, 2]}
        size={4}
        speed={0.8}
        color="#e6f7ff"
      />
      <Pickup itemId="journal-4" position={[0, 0, -2.6]} />
      {/* Zones take world coordinates: cave centre local (0, −2) under the group's −0.5 rad turn. */}
      <SecretZone
        id="waterfall-passage"
        position={[x + 2 * Math.sin(0.5), y + 1, z - 2 * Math.cos(0.5)]}
        size={[1.2, 2.5, 1.2]}
      />
    </group>
  )
}

/** Mossy forest between the beach and the ruins: drifting pollen, a page caught in the roots. */
const Forest = () => {
  const tier = useTier()
  const centre = ground(42, 52)
  return (
    <>
      <Waterfall />
      <Sparkles
        count={tier === 'high' ? 120 : 40}
        scale={[50, 6, 50]}
        position={[centre[0], centre[1] + 3, centre[2]]}
        size={3}
        speed={0.25}
        color="#fff3b0"
      />
      <Pickup itemId="journal-2" position={ground(34, 64, 0)} />
      <RigidBody type="fixed" colliders="hull" position={ground(35.5, 64.5, 0.2)} rotation={[0, 0.7, 0.2]}>
        <mesh material={darkStone} castShadow>
          <dodecahedronGeometry args={[0.9, 0]} />
        </mesh>
      </RigidBody>
    </>
  )
}

export { Forest }
