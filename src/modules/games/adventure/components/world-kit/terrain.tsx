import { useEffect, useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

type TerrainProps = {
  size: number
  segments: number
  height: (x: number, z: number) => number
  /** Vertex colour from height and slope (0 flat … 1 vertical). */
  color: (h: number, slope: number, x: number, z: number) => THREE.Color
}

/** Height-field mesh with baked vertex colours and a matching trimesh collider. */
const Terrain = ({ size, segments, height, color }: TerrainProps) => {
  const [geometry] = useState(() => {
    const g = new THREE.PlaneGeometry(size, size, segments, segments)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)))
    g.computeVertexNormals()
    const normals = g.attributes.normal as THREE.BufferAttribute
    const colors = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const c = color(pos.getY(i), 1 - normals.getY(i), pos.getX(i), pos.getZ(i))
      colors.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  })
  const [material] = useState(
    () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }),
  )
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh geometry={geometry} material={material} receiveShadow />
    </RigidBody>
  )
}

export { Terrain }
