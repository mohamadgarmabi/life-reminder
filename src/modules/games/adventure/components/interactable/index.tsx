import { useEffect, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import {
  useEngine,
  useGame,
  useRuntimeRef,
  patchGame,
  updateSession,
} from '#/modules/games/adventure/stores/session.store'
import { pickTarget } from '#/modules/games/adventure/utils/interaction'
import { addItem } from '#/modules/games/adventure/utils/session'
import { playSfx } from '#/modules/games/adventure/utils/audio'
import { useHasItem } from '#/modules/games/adventure/hooks/world.hook'

const markerMaterial = new THREE.MeshBasicMaterial({ color: '#ffe8a3', toneMapped: false })
const markerGeometry = new THREE.OctahedronGeometry(0.14)

/** Glowing diamond bobbing above whatever the action button applies to. */
const Marker = ({ height }: { height: number }) => {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = height + Math.sin(clock.elapsedTime * 3) * 0.08
    ref.current.rotation.y = clock.elapsedTime * 2
  })
  return <mesh ref={ref} geometry={markerGeometry} material={markerMaterial} />
}

type InteractableProps = Omit<ThreeElements['group'], 'children' | 'id'> & {
  id: string
  label: string
  onUse: () => void
  radius?: number
  enabled?: boolean
  /** Marker height above the group origin. */
  markerHeight?: number
  children?: ReactNode
}

/** Makes its children usable: highlighted in reach, drives the action button. */
const Interactable = ({
  id,
  label,
  onUse,
  radius = 2.4,
  enabled = true,
  markerHeight = 1.6,
  children,
  ...group
}: InteractableProps) => {
  const runtimeRef = useRuntimeRef()
  const ref = useRef<THREE.Group>(null)
  const near = useGame((g) => g.nearby?.id === id)

  useEffect(() => {
    if (!enabled || !ref.current) return
    ref.current.updateWorldMatrix(true, false)
    const position = ref.current.getWorldPosition(new THREE.Vector3())
    const { interactables } = runtimeRef.current
    interactables.set(id, { id, label, position, radius, onUse })
    return () => {
      interactables.delete(id)
    }
  }, [runtimeRef, id, label, radius, onUse, enabled])

  return (
    <group ref={ref} {...group}>
      {children}
      {near && enabled && <Marker height={markerHeight} />}
    </group>
  )
}

/** Runs target picking a few times a second and updates the action button. */
const InteractionPicker = () => {
  const { store } = useEngine()
  const runtimeRef = useRuntimeRef()
  const acc = useRef(0)
  useFrame((_, dt) => {
    acc.current += dt
    if (acc.current < 0.1) return
    acc.current = 0
    const { interactables, player, camera } = runtimeRef.current
    const best = pickTarget(interactables.values(), player.position, camera.forward)
    const current = store.state.nearby
    if (best?.id !== current?.id || best?.label !== current?.label)
      patchGame(store, { nearby: best ? { id: best.id, label: best.label } : null })
  })
  return null
}

const paper = new THREE.MeshStandardMaterial({ color: '#efe2c2', roughness: 0.9, side: THREE.DoubleSide })
const ribbon = new THREE.MeshStandardMaterial({ color: '#9c3d2e', roughness: 0.8 })

/** Default look for a journal page: a rolled scroll. */
const Scroll = () => (
  <group rotation={[0, 0.6, Math.PI / 2]} position={[0, 0.12, 0]}>
    <mesh material={paper} castShadow>
      <cylinderGeometry args={[0.07, 0.07, 0.42, 8]} />
    </mesh>
    <mesh material={ribbon}>
      <torusGeometry args={[0.075, 0.015, 4, 10]} />
    </mesh>
  </group>
)

type PickupProps = Omit<InteractableProps, 'id' | 'label' | 'onUse'> & { itemId: string; onPick?: () => void }

/** An item to collect; hides itself once in the inventory. Journal pages open in the reader. */
const Pickup = ({ itemId, onPick, children, ...rest }: PickupProps) => {
  const { world, store } = useEngine()
  const has = useHasItem(itemId)
  const item = world.items[itemId]
  if (has) return null
  const journal = item.kind === 'journal'
  const onUse = () => {
    updateSession(store, (s) => addItem(s, itemId))
    playSfx(journal ? 'page' : 'pickup')
    if (journal) patchGame(store, { reading: itemId, phase: 'paused' })
    else patchGame(store, { notice: `${item.name} برداشته شد` })
    onPick?.()
  }
  return (
    <Interactable
      id={`pickup:${itemId}`}
      label={journal ? 'خواندن' : 'برداشتن'}
      onUse={onUse}
      markerHeight={0.9}
      {...rest}
    >
      {children ?? (journal ? <Scroll /> : null)}
    </Interactable>
  )
}

export { Interactable, InteractionPicker, Pickup }
