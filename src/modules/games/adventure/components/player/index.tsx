import { useEffect, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, useRapier, type RapierCollider, type RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useEngine, useRuntimeRef } from '#/modules/games/adventure/stores/session.store'
import { playSfx } from '#/modules/games/adventure/utils/audio'

const SPEED = 4.2
const GRAVITY = 22
const HALF_HEIGHT = 0.5
const RADIUS = 0.35
const DEG = Math.PI / 180

const cloth = new THREE.MeshStandardMaterial({ color: '#c2553a', roughness: 0.85, flatShading: true })
const skin = new THREE.MeshStandardMaterial({ color: '#e8b98f', roughness: 0.7 })
const dark = new THREE.MeshStandardMaterial({ color: '#3b2a22', roughness: 0.9 })
const scarf = new THREE.MeshStandardMaterial({ color: '#e9c46a', roughness: 0.8 })

/** Hooded traveller built from primitives; legs/arms swing with speed. */
const Traveller = ({ limbs }: { limbs: RefObject<THREE.Group[]> }) => {
  const setLimb = (i: number) => (g: THREE.Group | null) => {
    if (g) limbs.current[i] = g
  }
  return (
    <group position={[0, -(HALF_HEIGHT + RADIUS), 0]}>
      {[-0.13, 0.13].map((x, i) => (
        <group key={x} ref={setLimb(i)} position={[x, 0.62, 0]}>
          <mesh material={dark} position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.42, 3, 6]} />
          </mesh>
        </group>
      ))}
      <mesh material={cloth} position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.36, 0.75, 7]} />
      </mesh>
      {[-0.3, 0.3].map((x, i) => (
        <group key={x} ref={setLimb(i + 2)} position={[x, 1.22, 0]}>
          <mesh material={cloth} position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.36, 3, 6]} />
          </mesh>
        </group>
      ))}
      <mesh material={scarf} position={[0, 1.3, 0]} castShadow>
        <torusGeometry args={[0.17, 0.07, 6, 10]} />
      </mesh>
      <mesh material={skin} position={[0, 1.5, 0.02]} castShadow>
        <sphereGeometry args={[0.17, 10, 8]} />
      </mesh>
      <mesh material={cloth} position={[0, 1.58, -0.03]} rotation={[-0.2, 0, 0]} castShadow>
        <coneGeometry args={[0.24, 0.5, 7, 1, true]} />
      </mesh>
      {/* Satchel strap */}
      <mesh material={dark} position={[0.24, 0.92, 0.05]} castShadow>
        <boxGeometry args={[0.14, 0.18, 0.12]} />
      </mesh>
    </group>
  )
}

type PlayerProps = { killY: number }

const Player = ({ killY }: PlayerProps) => {
  const { world: adventure } = useEngine()
  const runtimeRef = useRuntimeRef()
  const body = useRef<RapierRigidBody>(null)
  const collider = useRef<RapierCollider>(null)
  const model = useRef<THREE.Group>(null)
  const limbs = useRef<THREE.Group[]>([])
  const { world } = useRapier()
  // Created and freed in one effect, so StrictMode's mount/unmount/mount never leaves a freed controller.
  const controller = useRef<ReturnType<typeof world.createCharacterController> | null>(null)
  useEffect(() => {
    const c = world.createCharacterController(0.05)
    c.enableAutostep(0.45, 0.2, true)
    c.enableSnapToGround(0.4)
    c.setMaxSlopeClimbAngle(50 * DEG)
    c.setMinSlopeSlideAngle(55 * DEG)
    c.setSlideEnabled(true)
    c.setApplyImpulsesToDynamicBodies(false)
    controller.current = c
    return () => {
      controller.current = null
      world.removeCharacterController(c)
    }
  }, [world])

  const state = useRef({ vy: 0, facing: 0, stride: 0, nextStep: 0 })
  const start = adventure.checkpoints.start.position

  useFrame((_, rawDt) => {
    const rb = body.current
    const col = collider.current
    const cc = controller.current
    if (!rb || !col || !cc) return
    const dt = Math.min(rawDt, 0.05)
    const s = state.current
    const runtime = runtimeRef.current
    const p = runtime.player

    if (p.teleport) {
      rb.setTranslation({ x: p.teleport[0], y: p.teleport[1], z: p.teleport[2] }, true)
      rb.setNextKinematicTranslation({ x: p.teleport[0], y: p.teleport[1], z: p.teleport[2] })
      p.position.set(...p.teleport)
      p.teleport = null
      s.vy = 0
      return
    }

    const { x: mx, y: my } = runtime.input.move
    const yaw = runtime.camera.yaw
    // Camera looks along -(sin yaw, cos yaw): stick up = away from the camera.
    const fx = -Math.sin(yaw)
    const fz = -Math.cos(yaw)
    const dx = (fx * my + -fz * mx) * SPEED
    const dz = (fz * my + fx * mx) * SPEED
    s.vy = p.grounded ? -2 : Math.max(s.vy - GRAVITY * dt, -30)

    cc.computeColliderMovement(col, { x: dx * dt, y: s.vy * dt, z: dz * dt })
    const m = cc.computedMovement()
    const t = rb.translation()
    const next = { x: t.x + m.x, y: t.y + m.y, z: t.z + m.z }
    rb.setNextKinematicTranslation(next)
    p.grounded = cc.computedGrounded()
    p.position.set(next.x, next.y, next.z)
    if (p.grounded) p.lastGround = [next.x, next.y, next.z]

    // Deep water or a fall off the world: back to the nearest checkpoint, nothing lost.
    if (next.y < killY) {
      let best = adventure.checkpoints.start
      let bestD = Infinity
      for (const cp of Object.values(adventure.checkpoints)) {
        const d = Math.hypot(cp.position[0] - next.x, cp.position[2] - next.z)
        if (d < bestD) {
          best = cp
          bestD = d
        }
      }
      p.teleport = best.position
      playSfx('water')
    }

    // Facing and limb swing.
    const speed = Math.hypot(dx, dz)
    if (speed > 0.2) {
      const target = Math.atan2(dx, dz)
      let diff = target - s.facing
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      s.facing += diff * Math.min(1, dt * 12)
    }
    if (model.current) model.current.rotation.y = s.facing
    s.stride += speed * dt * 2.2
    const swing = Math.sin(s.stride) * Math.min(1, speed / SPEED) * 0.7
    const [l, r, la, ra] = limbs.current
    if (l && r && la && ra) {
      l.rotation.x = swing
      r.rotation.x = -swing
      la.rotation.x = -swing * 0.8
      ra.rotation.x = swing * 0.8
    }
    if (p.grounded && speed > 0.5 && s.stride > s.nextStep) {
      s.nextStep = s.stride + Math.PI
      playSfx('step')
    }
  })

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      colliders={false}
      position={start}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider ref={collider} args={[HALF_HEIGHT, RADIUS]} />
      <group ref={model}>
        <Traveller limbs={limbs} />
      </group>
    </RigidBody>
  )
}

export { Player }
