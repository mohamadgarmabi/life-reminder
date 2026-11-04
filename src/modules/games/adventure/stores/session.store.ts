import { createContext, useContext, useRef } from 'react'
import { createStore, useSelector, type Store } from '@tanstack/react-store'
import * as THREE from 'three'
import type {
  AdventureSettings,
  AdventureWorld,
  InteractionTarget,
  LoadResult,
  Phase,
  SaveGame,
  Session,
  Vec3,
} from '#/modules/games/adventure/types'
import { createSession } from '#/modules/games/adventure/utils/session'
import { DEFAULT_SETTINGS } from '#/modules/games/adventure/utils/save'

type GameState = {
  session: Session
  phase: Phase
  /** Current action-button target. */
  nearby: InteractionTarget | null
  /** Transient message shown over the game. */
  notice: string | null
  settings: AdventureSettings
  /** Journal page open in the reader. */
  reading: string | null
  saveStatus: LoadResult['status']
  /** Save found at load time, offered by "continue". */
  loadedSave: SaveGame | null
  /** Area the player is in, for ambience and hints. */
  area: string
  /** Quality actually in use (auto resolved). */
  tier: 'low' | 'high'
}

type Interactable = {
  id: string
  label: string
  position: THREE.Vector3
  radius: number
  onUse: () => void
}

/** Per-frame data lives here, outside React state. */
type Runtime = {
  input: { move: { x: number; y: number }; look: { x: number; y: number } }
  player: {
    position: THREE.Vector3
    grounded: boolean
    /** Last position on the ground; saved instead of mid-air positions. */
    lastGround: Vec3 | null
    teleport: Vec3 | null
  }
  camera: { yaw: number; pitch: number; forward: THREE.Vector3 }
  interactables: Map<string, Interactable>
  /** Unpaused play time, copied into the session on save. */
  playTimeMs: number
  /** Point the ending camera circles. */
  endingAt: THREE.Vector3 | null
}

type Engine = { world: AdventureWorld; store: Store<GameState>; runtime: Runtime }

const createEngine = (world: AdventureWorld): Engine => ({
  world,
  store: createStore<GameState>({
    session: createSession(world),
    phase: 'loading',
    nearby: null,
    notice: null,
    settings: DEFAULT_SETTINGS,
    reading: null,
    saveStatus: 'none',
    loadedSave: null,
    area: 'start',
    tier: 'high',
  }),
  runtime: {
    input: { move: { x: 0, y: 0 }, look: { x: 0, y: 0 } },
    player: {
      position: new THREE.Vector3(...world.checkpoints.start.position),
      grounded: false,
      lastGround: null,
      teleport: null,
    },
    camera: { yaw: world.checkpoints.start.yaw, pitch: 0.35, forward: new THREE.Vector3(0, 0, -1) },
    interactables: new Map(),
    playTimeMs: 0,
    endingAt: null,
  },
})

const EngineContext = createContext<Engine | null>(null)

const useEngine = () => {
  const engine = useContext(EngineContext)
  if (!engine) throw new Error('useEngine outside <AdventureGame>')
  return engine
}

/** Per-frame data as a ref: write it in frame/event callbacks, never read it during render. */
const useRuntimeRef = () => useRef(useEngine().runtime)

const useGame = <T>(selector: (s: GameState) => T) => useSelector(useEngine().store, selector)

const patchGame = (store: Store<GameState>, patch: Partial<GameState>) => store.setState((s) => ({ ...s, ...patch }))

const updateSession = (store: Store<GameState>, fn: (s: Session) => Session) =>
  store.setState((g) => {
    const session = fn(g.session)
    return session === g.session ? g : { ...g, session }
  })

export { createEngine, EngineContext, useEngine, useRuntimeRef, useGame, patchGame, updateSession }
export type { GameState, Interactable, Runtime, Engine }
