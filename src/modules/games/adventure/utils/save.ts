import { z } from 'zod'
import { loadGameData, saveGameData } from '#/modules/games/utils/game-db'
import { SAVE_VERSION } from '#/modules/games/adventure/utils/session'
import type { AdventureSettings, AdventureWorld, LoadResult, SaveGame } from '#/modules/games/adventure/types'

const saveKey = (worldId: string) => `adventure:${worldId}:save`
const SETTINGS_KEY = 'adventure:settings'

const vec3 = z.tuple([z.number(), z.number(), z.number()])

const saveSchema = z.object({
  version: z.number(),
  worldId: z.string(),
  checkpointId: z.string(),
  position: vec3.nullable(),
  yaw: z.number(),
  inventory: z.array(z.string()),
  puzzles: z.record(z.string(), z.unknown()),
  secrets: z.array(z.string()),
  playTimeMs: z.number().min(0),
  completed: z.boolean(),
  savedAt: z.number(),
})

/** version n → n+1. Empty until the save format first changes; exported so tests can exercise the path. */
const migrations: Record<number, (old: Record<string, unknown>) => Record<string, unknown>> = {}

const migrate = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object') return raw
  let value = raw as Record<string, unknown>
  let version = typeof value.version === 'number' ? value.version : 0
  while (version < SAVE_VERSION && migrations[version]) {
    value = { ...migrations[version](value), version: version + 1 }
    version += 1
  }
  return value
}

/** Missing → none; unreadable → the raw value is kept under a :corrupt: key, never deleted. */
const loadSave = async (world: AdventureWorld, now = Date.now()): Promise<LoadResult> => {
  const raw = await loadGameData(saveKey(world.id), z.unknown())
  if (raw === null || raw === undefined) return { status: 'none' }
  const parsed = saveSchema.safeParse(migrate(raw))
  if (!parsed.success || parsed.data.worldId !== world.id) {
    const savedAt = (raw as { savedAt?: unknown }).savedAt
    await saveGameData(`${saveKey(world.id)}:corrupt:${typeof savedAt === 'number' ? savedAt : now}`, raw)
    return { status: 'corrupt' }
  }
  return { status: 'ok', save: parsed.data }
}

/** Resolves false when the value could not be stored (game-db swallows storage errors). */
const writeSave = async (save: SaveGame): Promise<boolean> => {
  await saveGameData(saveKey(save.worldId), save)
  const back = await loadGameData(saveKey(save.worldId), saveSchema)
  return back?.savedAt === save.savedAt
}

const DEFAULT_SETTINGS: AdventureSettings = {
  version: 1,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  lookSensitivity: 1,
  invertY: false,
  leftHanded: false,
  quality: 'auto',
  hintSeen: false,
}

const settingsSchema = z.object({
  version: z.number().catch(1),
  musicVolume: z.number().min(0).max(1).catch(DEFAULT_SETTINGS.musicVolume),
  sfxVolume: z.number().min(0).max(1).catch(DEFAULT_SETTINGS.sfxVolume),
  lookSensitivity: z.number().min(0.5).max(2).catch(DEFAULT_SETTINGS.lookSensitivity),
  invertY: z.boolean().catch(false),
  leftHanded: z.boolean().catch(false),
  quality: z.enum(['auto', 'low', 'high']).catch('auto'),
  hintSeen: z.boolean().catch(false),
})

const loadSettings = async (): Promise<AdventureSettings> =>
  (await loadGameData(SETTINGS_KEY, settingsSchema)) ?? DEFAULT_SETTINGS

const writeSettings = (settings: AdventureSettings) => saveGameData(SETTINGS_KEY, settings)

export { saveKey, migrations, loadSave, writeSave, DEFAULT_SETTINGS, loadSettings, writeSettings }
