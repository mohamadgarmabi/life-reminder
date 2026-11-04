import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { useGame, useRuntimeRef } from '#/modules/games/adventure/stores/session.store'

const ARM = 5.2
const MIN_ARM = 1.1
const LOOK_SPEED = 0.006
const PITCH_MIN = -10 * (Math.PI / 180)
const PITCH_MAX = 60 * (Math.PI / 180)

const target = new THREE.Vector3()
const dir = new THREE.Vector3()
const desired = new THREE.Vector3()

/** Third-person orbit camera; pulls in when scenery would block the view. Circles the beacon in the ending. */
const FollowCamera = () => {
  const runtimeRef = useRuntimeRef()
  const { world, rapier } = useRapier()
  const sensitivity = useGame((g) => g.settings.lookSensitivity)
  const invertY = useGame((g) => g.settings.invertY)
  const phase = useGame((g) => g.phase)
  const arm = useRef(ARM)
  const endingT = useRef(0)

  useFrame(({ camera }, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const runtime = runtimeRef.current
    const cam = runtime.camera
    const look = runtime.input.look

    if (phase === 'ending' && runtime.endingAt) {
      endingT.current += dt
      const t = endingT.current
      const a = cam.yaw + t * 0.25
      const r = 18 - Math.min(t, 8)
      desired.set(
        runtime.endingAt.x + Math.sin(a) * r,
        runtime.endingAt.y + 4 + t * 0.9,
        runtime.endingAt.z + Math.cos(a) * r,
      )
      camera.position.lerp(desired, 1 - Math.exp(-2 * dt))
      camera.lookAt(runtime.endingAt.x, runtime.endingAt.y + 3, runtime.endingAt.z)
      return
    }
    endingT.current = 0

    cam.yaw -= look.x * LOOK_SPEED * sensitivity
    cam.pitch += look.y * LOOK_SPEED * sensitivity * (invertY ? -1 : 1)
    cam.pitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, cam.pitch))
    look.x = 0
    look.y = 0

    target.copy(runtime.player.position).add({ x: 0, y: 0.75, z: 0 })
    dir.set(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch))

    // Start the ray just outside the player's capsule so it never hits the player.
    const origin = target.clone().addScaledVector(dir, 0.5)
    const hit = world.castRay(new rapier.Ray(origin, dir), ARM, true)
    const free = hit ? Math.max(MIN_ARM, hit.timeOfImpact + 0.5 - 0.3) : ARM
    // Pull in fast, ease back out slowly.
    arm.current += (free - arm.current) * (free < arm.current ? 1 : 1 - Math.exp(-3 * dt))

    desired.copy(target).addScaledVector(dir, arm.current)
    camera.position.lerp(desired, 1 - Math.exp(-14 * dt))
    camera.lookAt(target)
    cam.forward.set(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw))
  })

  return null
}

export { FollowCamera }
