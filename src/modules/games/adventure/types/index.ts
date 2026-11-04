import type { ComponentType } from 'react'
import type { z } from 'zod'

type Vec3 = [number, number, number]

type ItemKind = 'artifact' | 'journal' | 'tool'

type ItemDef = {
  id: string
  kind: ItemKind
  name: string
  description: string
  /** Emoji shown in the inventory (worlds are procedural, no image files). */
  icon: string
  /** Required when kind = journal. */
  text?: string
}

type PuzzleContext = { has: (itemId: string) => boolean }

type PuzzleDef<S = unknown, A = unknown> = {
  id: string
  schema: z.ZodType<S>
  initial: S
  /** Pure: wrong input returns a state, never throws. */
  apply: (state: S, action: A, ctx: PuzzleContext) => S
  isSolved: (state: S) => boolean
  /** Applied once, when it first becomes solved. */
  reward?: { give?: string[]; take?: string[] }
}

type Checkpoint = { id: string; position: Vec3; yaw: number }

type SecretDef = { id: string; kind: 'passage' | 'discovery' }

type ObjectiveDef = { requires: string[]; trigger: 'reach' }

type AdventureWorld = {
  /** Unique and URL-safe; used in the route and the save key. */
  id: string
  title: string
  description: string
  items: Record<string, ItemDef>
  // Each puzzle has its own state/action types; the engine only passes them through.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  puzzles: Record<string, PuzzleDef<any, any>>
  /** Must include `start`. */
  checkpoints: Record<string, Checkpoint>
  secrets: Record<string, SecretDef>
  objective: ObjectiveDef
  /** Persian hint per area id. */
  hints: Record<string, string>
  /** Below this height the player respawns at the nearest checkpoint (deep water, falls). */
  killY: number
  Scene: ComponentType
}

type SaveGame = {
  version: number
  worldId: string
  checkpointId: string
  /** Last position on the ground; null = use the checkpoint. */
  position: Vec3 | null
  yaw: number
  inventory: string[]
  puzzles: Record<string, unknown>
  secrets: string[]
  playTimeMs: number
  completed: boolean
  savedAt: number
}

type Quality = 'auto' | 'low' | 'high'

type AdventureSettings = {
  version: number
  musicVolume: number
  sfxVolume: number
  lookSensitivity: number
  invertY: boolean
  leftHanded: boolean
  quality: Quality
  hintSeen: boolean
}

type Phase = 'loading' | 'menu' | 'playing' | 'paused' | 'ending' | 'summary'

type InteractionTarget = { id: string; label: string }

type Session = Omit<SaveGame, 'version' | 'savedAt' | 'position' | 'yaw'>

type LoadResult = { status: 'none' } | { status: 'corrupt' } | { status: 'ok'; save: SaveGame }

export type {
  Vec3,
  ItemKind,
  ItemDef,
  PuzzleContext,
  PuzzleDef,
  Checkpoint,
  SecretDef,
  ObjectiveDef,
  AdventureWorld,
  SaveGame,
  Quality,
  AdventureSettings,
  Phase,
  InteractionTarget,
  Session,
  LoadResult,
}
