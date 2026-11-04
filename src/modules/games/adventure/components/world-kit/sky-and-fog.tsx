import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import { useRuntimeRef } from '#/modules/games/adventure/stores/session.store'
import { useTier } from '#/modules/games/adventure/hooks/world.hook'

type SkyAndFogProps = {
  sun: [number, number, number]
  fog: string
  /** FogExp2 density at high quality; low quality fogs in closer (hides the shorter draw distance). */
  density: number
  sunColor?: string
  sunIntensity?: number
}

const sunOffset = new THREE.Vector3()

/** Sky dome, exponential fog and a sun whose shadow box follows the player. */
const SkyAndFog = ({ sun, fog, density, sunColor = '#ffd8a0', sunIntensity = 2.4 }: SkyAndFogProps) => {
  const runtimeRef = useRuntimeRef()
  const tier = useTier()
  const light = useRef<THREE.DirectionalLight>(null)
  const fogDensity = tier === 'low' ? density * 1.5 : density

  useFrame(() => {
    const l = light.current
    if (!l) return
    sunOffset
      .set(...sun)
      .normalize()
      .multiplyScalar(60)
    const { position } = runtimeRef.current.player
    l.position.copy(position).add(sunOffset)
    l.target.position.copy(position)
    l.target.updateMatrixWorld()
  })

  return (
    <>
      <fogExp2 attach="fog" args={[fog, fogDensity]} density={fogDensity} />
      <color attach="background" args={[fog]} />
      <Sky
        sunPosition={sun}
        turbidity={6}
        rayleigh={1.6}
        mieCoefficient={0.006}
        mieDirectionalG={0.85}
        distance={4500}
      />
      <hemisphereLight args={['#bcd8ff', '#6d5a3e', 0.9]} />
      <directionalLight
        ref={light}
        color={sunColor}
        intensity={sunIntensity}
        castShadow={tier === 'high'}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
      />
    </>
  )
}

const makeFogTexture = () => {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,0.55)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.18)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

type FogBanksProps = { banks: { position: [number, number, number]; scale: number }[]; color?: string }

/** Soft drifting billboards that read as low, volumetric fog. */
const FogBanks = ({ banks, color = '#e8eef2' }: FogBanksProps) => {
  const tier = useTier()
  const group = useRef<THREE.Group>(null)
  const [material] = useState(
    () =>
      new THREE.SpriteMaterial({
        map: makeFogTexture(),
        color,
        transparent: true,
        depthWrite: false,
        opacity: 0.8,
        fog: true,
      }),
  )
  useEffect(
    () => () => {
      material.map?.dispose()
      material.dispose()
    },
    [material],
  )
  useFrame(({ clock }) => {
    group.current?.children.forEach((s, i) => {
      s.position.x = banks[i].position[0] + Math.sin(clock.elapsedTime * 0.05 + i) * 4
    })
  })
  const shown = tier === 'low' ? banks.filter((_, i) => i % 2 === 0) : banks
  return (
    <group ref={group}>
      {shown.map((b, i) => (
        <sprite key={i} material={material} position={b.position} scale={[b.scale * 2.2, b.scale * 0.7, 1]} />
      ))}
    </group>
  )
}

export { SkyAndFog, FogBanks }
