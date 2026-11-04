import { RigidBody } from '@react-three/rapier'
import type { AdventureWorld } from '#/modules/games/adventure/types'
import { AdventureGame } from '#/modules/games/adventure/components/adventure-game'
import { Interactable, Pickup } from '#/modules/games/adventure/components/interactable'
import { Areas, ObjectiveZone } from '#/modules/games/adventure/components/zones'
import { usePuzzle } from '#/modules/games/adventure/hooks/world.hook'
import { TEST_ROOM_DATA } from '#/modules/games/adventure/worlds/test-room/content'

// Built only from engine imports, with no engine changes: the reuse check for the next world (SC-009).

const Room = () => {
  const [, pull, open] = usePuzzle<{ pulled: boolean }, 'pull'>('lever')
  return (
    <>
      <color attach="background" args={['#22262e']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 8, 6]} intensity={2} castShadow />
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.25, 0]} receiveShadow>
          <boxGeometry args={[14, 0.5, 18]} />
          <meshStandardMaterial color="#5a5f69" />
        </mesh>
        {[-7, 7].map((x) => (
          <mesh key={x} position={[x, 2, 0]}>
            <boxGeometry args={[0.5, 4, 18]} />
            <meshStandardMaterial color="#6b707a" />
          </mesh>
        ))}
        <mesh position={[0, 2, 9]}>
          <boxGeometry args={[14, 4, 0.5]} />
          <meshStandardMaterial color="#6b707a" />
        </mesh>
        {[-4.5, 4.5].map((x) => (
          <mesh key={x} position={[x, 2, -9]}>
            <boxGeometry args={[5, 4, 0.5]} />
            <meshStandardMaterial color="#6b707a" />
          </mesh>
        ))}
        <mesh position={[3, 0.5, 3]}>
          <boxGeometry args={[1.6, 1, 1]} />
          <meshStandardMaterial color="#7a5434" />
        </mesh>
      </RigidBody>
      {!open && (
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2, -9]}>
            <boxGeometry args={[4, 4, 0.4]} />
            <meshStandardMaterial color="#3b2a22" />
          </mesh>
        </RigidBody>
      )}
      <Pickup itemId="key" position={[3, 1, 3]}>
        <mesh>
          <torusGeometry args={[0.15, 0.04, 6, 12]} />
          <meshStandardMaterial color="#d4a73a" metalness={0.7} roughness={0.3} />
        </mesh>
      </Pickup>
      <Interactable id="lever" label="کشیدن اهرم" enabled={!open} onUse={() => pull('pull')} position={[-4, 0, -6]}>
        <mesh position={[0, 1, 0]} rotation={[open ? -0.8 : 0.8, 0, 0]}>
          <boxGeometry args={[0.15, 1.2, 0.15]} />
          <meshStandardMaterial color="#9a9a9a" />
        </mesh>
      </Interactable>
      <ObjectiveZone position={[0, 1, -11]} size={[2, 2, 1.5]} />
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.25, -12]}>
          <boxGeometry args={[4, 0.5, 6]} />
          <meshStandardMaterial color="#5a5f69" />
        </mesh>
      </RigidBody>
      <Areas areas={[{ id: 'start', position: [0, 0], ambience: 'room' }]} />
    </>
  )
}

const testRoom: AdventureWorld = { ...TEST_ROOM_DATA, Scene: Room }

const TestRoomView = () => <AdventureGame world={testRoom} />

export default TestRoomView
