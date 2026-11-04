import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type SeaProps = {
  size?: number
  level?: number
  shallow?: string
  deep?: string
  /** Distance from the origin where shallow turns deep. */
  shoreRadius?: number
}

/** Animated wave sea: standard material (so lighting and fog apply) with vertex waves. No textures. */
const Sea = ({ size = 900, level = 0, shallow = '#3fb6b0', deep = '#0d4a6b', shoreRadius = 150 }: SeaProps) => {
  const [geometry] = useState(() => new THREE.PlaneGeometry(size, size, 96, 96).rotateX(-Math.PI / 2))
  const mesh = useRef<THREE.Mesh>(null)
  const [material] = useState(() => {
    const m = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.88 })
    const uniforms = {
      uTime: { value: 0 },
      uShallow: { value: new THREE.Color(shallow) },
      uDeep: { value: new THREE.Color(deep) },
      uShore: { value: shoreRadius },
    }
    // Kept on the material so the frame loop can reach it through the mesh ref.
    m.userData.uTime = uniforms.uTime
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms)
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uTime;
          varying float vDist;
          varying float vCrest;
          float wave(vec2 p, vec2 d, float f, float s) { return sin(dot(p, d) * f + uTime * s); }`,
        )
        .replace(
          '#include <begin_vertex>',
          `vec3 transformed = vec3(position);
          vec2 p = (modelMatrix * vec4(position, 1.0)).xz;
          float h = 0.35 * wave(p, vec2(0.8, 0.6), 0.12, 1.1) + 0.2 * wave(p, vec2(-0.5, 0.9), 0.23, 1.7)
                  + 0.08 * wave(p, vec2(0.9, -0.3), 0.6, 2.6);
          transformed.y += h;
          vCrest = h;
          vDist = length(p);`,
        )
        .replace(
          '#include <beginnormal_vertex>',
          `vec2 q = (modelMatrix * vec4(position, 1.0)).xz;
          float ex = 0.35 * 0.12 * 0.8 * cos(dot(q, vec2(0.8, 0.6)) * 0.12 + uTime * 1.1)
                   - 0.2 * 0.23 * 0.5 * cos(dot(q, vec2(-0.5, 0.9)) * 0.23 + uTime * 1.7);
          float ez = 0.35 * 0.12 * 0.6 * cos(dot(q, vec2(0.8, 0.6)) * 0.12 + uTime * 1.1)
                   + 0.2 * 0.23 * 0.9 * cos(dot(q, vec2(-0.5, 0.9)) * 0.23 + uTime * 1.7);
          vec3 objectNormal = normalize(vec3(-ex, 1.0, -ez));`,
        )
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform vec3 uShallow;
          uniform vec3 uDeep;
          uniform float uShore;
          varying float vDist;
          varying float vCrest;`,
        )
        .replace(
          'vec4 diffuseColor = vec4( diffuse, opacity );',
          `float depth = smoothstep(uShore * 0.75, uShore * 1.4, vDist);
          vec3 sea = mix(uShallow, uDeep, depth) + vec3(0.25) * smoothstep(0.35, 0.6, vCrest);
          vec4 diffuseColor = vec4(sea, opacity);`,
        )
    }
    return m
  })
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )
  useFrame((_, dt) => {
    const m = mesh.current?.material as THREE.Material | undefined
    if (m) m.userData.uTime.value += dt
  })
  return <mesh ref={mesh} geometry={geometry} material={material} position={[0, level, 0]} receiveShadow />
}

export { Sea }
