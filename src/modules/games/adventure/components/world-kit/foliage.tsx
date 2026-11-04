import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { CylinderCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useTier } from '#/modules/games/adventure/hooks/world.hook'

type Placement = { position: [number, number, number]; scale: number; rotation: number }

const wind = { value: 0 }

/** Adds a time-based sway to vertices, scaled by height above the instance origin. */
const swaying = (material: THREE.MeshStandardMaterial, strength: number) => {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWind = wind
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uWind;')
      .replace(
        '#include <begin_vertex>',
        `vec3 transformed = vec3(position);
        float sway = sin(uWind * 1.6 + instanceMatrix[3].x * 0.3 + instanceMatrix[3].z * 0.2);
        transformed.x += sway * ${strength.toFixed(3)} * max(position.y, 0.0);
        transformed.z += cos(uWind * 1.3 + instanceMatrix[3].x * 0.2) * ${(strength * 0.6).toFixed(3)} * max(position.y, 0.0);`,
      )
  }
  return material
}

/** Advances the shared wind clock (mount once per scene). */
const Wind = () => {
  useFrame((_, dt) => {
    wind.value += dt
  })
  return null
}

type InstancedProps = {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  items: Placement[]
  castShadow?: boolean
}

const Instanced = ({ geometry, material, items, castShadow }: InstancedProps) => {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    items.forEach((it, i) => {
      q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, it.rotation)
      m.compose(new THREE.Vector3(...it.position), q, new THREE.Vector3(it.scale, it.scale, it.scale))
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [items])
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, items.length]}
      castShadow={castShadow}
      receiveShadow
      frustumCulled={false}
    />
  )
}

type TreeKind = 'pine' | 'broadleaf' | 'palm'

const TREE_PARTS: Record<TreeKind, { trunk: string; leaves: string }> = {
  pine: { trunk: '#5a4030', leaves: '#2f5d3a' },
  broadleaf: { trunk: '#6b4a32', leaves: '#4f7d3a' },
  palm: { trunk: '#8a6a48', leaves: '#5e8f3c' },
}

const makeTreeGeometry = (kind: TreeKind) => {
  const trunk = new THREE.CylinderGeometry(0.12, 0.22, 3, 6).translate(0, 1.5, 0)
  const leaves =
    kind === 'pine'
      ? new THREE.ConeGeometry(1.5, 4.2, 7).translate(0, 4.4, 0)
      : kind === 'palm'
        ? new THREE.ConeGeometry(2.1, 0.9, 6, 1, true).translate(0, 3.6, 0)
        : new THREE.IcosahedronGeometry(1.7, 0).translate(0, 4, 0)
  return { trunk, leaves }
}

type TreesProps = { kind: TreeKind; items: Placement[]; leavesColor?: string }

/** Instanced trees with swaying canopies and trunk colliders. Low quality draws half. */
const Trees = ({ kind, items, leavesColor }: TreesProps) => {
  const tier = useTier()
  const [parts] = useState(() => {
    const g = makeTreeGeometry(kind)
    const colors = TREE_PARTS[kind]
    return {
      ...g,
      trunkMat: new THREE.MeshStandardMaterial({ color: colors.trunk, roughness: 1, flatShading: true }),
      leafMat: swaying(
        new THREE.MeshStandardMaterial({
          color: leavesColor ?? colors.leaves,
          roughness: 0.9,
          flatShading: true,
          side: THREE.DoubleSide,
        }),
        0.03,
      ),
    }
  })
  useEffect(
    () => () => {
      parts.trunk.dispose()
      parts.leaves.dispose()
      parts.trunkMat.dispose()
      parts.leafMat.dispose()
    },
    [parts],
  )
  const shown = tier === 'low' ? items.filter((_, i) => i % 2 === 0) : items
  return (
    <>
      <Instanced key={`t${shown.length}`} geometry={parts.trunk} material={parts.trunkMat} items={shown} castShadow />
      <Instanced key={`l${shown.length}`} geometry={parts.leaves} material={parts.leafMat} items={shown} castShadow />
      <RigidBody type="fixed" colliders={false}>
        {items.map((t, i) => (
          <CylinderCollider
            key={i}
            args={[1.5 * t.scale, 0.25 * t.scale]}
            position={[t.position[0], t.position[1] + 1.5 * t.scale, t.position[2]]}
          />
        ))}
      </RigidBody>
    </>
  )
}

type GrassProps = { items: Placement[]; color?: string }

/** Instanced grass tufts / ferns; no colliders. Low quality draws a third. */
const Grass = ({ items, color = '#6f9a45' }: GrassProps) => {
  const tier = useTier()
  const [parts] = useState(() => ({
    geometry: new THREE.ConeGeometry(0.25, 0.9, 4, 1).translate(0, 0.4, 0),
    material: swaying(new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true }), 0.12),
  }))
  useEffect(
    () => () => {
      parts.geometry.dispose()
      parts.material.dispose()
    },
    [parts],
  )
  const shown = tier === 'low' ? items.filter((_, i) => i % 3 === 0) : items
  return <Instanced key={shown.length} geometry={parts.geometry} material={parts.material} items={shown} />
}

type RocksProps = { items: Placement[]; color?: string; collide?: boolean }

/** Instanced boulders; with collide, each gets a ball collider. */
const Rocks = ({ items, color = '#8a8578', collide = true }: RocksProps) => {
  const [parts] = useState(() => ({
    geometry: new THREE.DodecahedronGeometry(1, 0),
    material: new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true }),
  }))
  useEffect(
    () => () => {
      parts.geometry.dispose()
      parts.material.dispose()
    },
    [parts],
  )
  return (
    <>
      <Instanced geometry={parts.geometry} material={parts.material} items={items} castShadow />
      {collide && (
        <RigidBody type="fixed" colliders={false}>
          {items.map((r, i) => (
            <CylinderCollider key={i} args={[0.8 * r.scale, 0.85 * r.scale]} position={r.position} />
          ))}
        </RigidBody>
      )}
    </>
  )
}

/** Deterministic scatter: n placements in a ring/disc, kept where accept(x, z) returns a ground height. */
const scatter = (
  seed: number,
  n: number,
  centre: [number, number],
  radius: [number, number],
  accept: (x: number, z: number) => number | null,
  scale: [number, number] = [0.8, 1.3],
): Placement[] => {
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const out: Placement[] = []
  for (let i = 0; i < n * 3 && out.length < n; i++) {
    const a = rand() * Math.PI * 2
    const r = radius[0] + Math.sqrt(rand()) * (radius[1] - radius[0])
    const x = centre[0] + Math.cos(a) * r
    const z = centre[1] + Math.sin(a) * r
    const y = accept(x, z)
    if (y === null) continue
    out.push({ position: [x, y, z], scale: scale[0] + rand() * (scale[1] - scale[0]), rotation: rand() * Math.PI * 2 })
  }
  return out
}

export { Wind, Trees, Grass, Rocks, scatter }
export type { Placement }
