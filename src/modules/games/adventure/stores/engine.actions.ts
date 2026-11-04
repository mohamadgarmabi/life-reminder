import type { Engine } from '#/modules/games/adventure/stores/session.store'
import { patchGame } from '#/modules/games/adventure/stores/session.store'
import type { AdventureSettings, SaveGame, Vec3 } from '#/modules/games/adventure/types'
import { createSession, toSave } from '#/modules/games/adventure/utils/session'
import { writeSave, writeSettings } from '#/modules/games/adventure/utils/save'
import { resumeAudio, setVolumes, suspendAudio, unlockAudio } from '#/modules/games/adventure/utils/audio'

const STORAGE_NOTICE = 'پیشرفت روی این دستگاه ذخیره نمی‌شود'

let writing: Promise<void> | null = null
let queued = false
let warned = false

/** Writes the current progress; at most one write in flight, a request during a write runs once after it. */
const saveNow = (engine: Engine): Promise<void> => {
  if (writing) {
    queued = true
    return writing
  }
  const { store, runtime } = engine
  const session = { ...store.state.session, playTimeMs: Math.round(runtime.playTimeMs) }
  const save = toSave(session, runtime.player.lastGround, runtime.camera.yaw, Date.now())
  writing = writeSave(save)
    .then((ok) => {
      if (!ok && !warned) {
        warned = true
        patchGame(store, { notice: STORAGE_NOTICE })
      }
    })
    .finally(() => {
      writing = null
      if (queued) {
        queued = false
        void saveNow(engine)
      }
    })
  return writing
}

const teleport = (engine: Engine, position: Vec3, yaw?: number) => {
  engine.runtime.player.teleport = position
  if (yaw !== undefined) engine.runtime.camera.yaw = yaw
}

const toCheckpoint = (engine: Engine) => {
  const cp = engine.world.checkpoints[engine.store.state.session.checkpointId] ?? engine.world.checkpoints.start
  teleport(engine, cp.position, cp.yaw)
}

/** Starts play from a save, or a new game when save is undefined. Must run inside a tap (audio unlock). */
const startGame = (engine: Engine, save?: SaveGame) => {
  unlockAudio()
  const session = createSession(engine.world, save)
  engine.runtime.playTimeMs = session.playTimeMs
  engine.runtime.player.lastGround = save?.position ?? null
  patchGame(engine.store, { session, phase: 'playing', reading: null })
  if (save?.position) teleport(engine, save.position, save.yaw)
  else toCheckpoint(engine)
  if (!save) void saveNow(engine)
}

const pause = (engine: Engine) => {
  const phase = engine.store.state.phase
  if (phase !== 'playing') return
  patchGame(engine.store, { phase: 'paused' })
  suspendAudio()
  void saveNow(engine)
}

const resume = (engine: Engine) => {
  unlockAudio()
  resumeAudio()
  patchGame(engine.store, { phase: 'playing', reading: null })
}

const updateSettings = (engine: Engine, patch: Partial<AdventureSettings>) => {
  const settings = { ...engine.store.state.settings, ...patch }
  patchGame(engine.store, { settings })
  setVolumes({ music: settings.musicVolume, sfx: settings.sfxVolume })
  void writeSettings(settings)
}

export { saveNow, teleport, toCheckpoint, startGame, pause, resume, updateSettings }
