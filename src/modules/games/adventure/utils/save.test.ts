import { afterEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { loadGameData, saveGameData } from '#/modules/games/utils/game-db'
import type { AdventureWorld } from '#/modules/games/adventure/types'
import { createSession, toSave } from '#/modules/games/adventure/utils/session'
import {
  DEFAULT_SETTINGS,
  loadSave,
  loadSettings,
  migrations,
  saveKey,
  writeSave,
  writeSettings,
} from '#/modules/games/adventure/utils/save'

const world = (id: string): AdventureWorld => ({
  id,
  title: id,
  description: '',
  items: { a: { id: 'a', kind: 'tool', name: 'a', description: '', icon: 'a' } },
  puzzles: {},
  checkpoints: { start: { id: 'start', position: [0, 0, 0], yaw: 0 } },
  secrets: {},
  objective: { requires: [], trigger: 'reach' },
  hints: {},
  killY: -20,
  Scene: () => null,
})

afterEach(() => {
  delete migrations[0]
})

describe('adventure saves', () => {
  it('reports none when there is no save', async () => {
    expect(await loadSave(world('empty'))).toEqual({ status: 'none' })
  })

  it('round-trips a save', async () => {
    const w = world('round')
    const save = toSave({ ...createSession(w), inventory: ['a'] }, [1, 2, 3], 0.3, 42)
    expect(await writeSave(save)).toBe(true)
    expect(await loadSave(w)).toEqual({ status: 'ok', save })
  })

  it('migrates an older save version', async () => {
    const w = world('old')
    migrations[0] = (old) => ({ ...toSave(createSession(w), null, 0, 7), inventory: old.items })
    await saveGameData(saveKey(w.id), { items: ['a'] })
    const result = await loadSave(w)
    expect(result.status).toBe('ok')
    if (result.status === 'ok') expect(result.save.inventory).toEqual(['a'])
  })

  it('keeps an unreadable save under a corrupt key instead of deleting it', async () => {
    const w = world('broken')
    const raw = { savedAt: 555, junk: true }
    await saveGameData(saveKey(w.id), raw)
    expect(await loadSave(w)).toEqual({ status: 'corrupt' })
    expect(await loadGameData(`${saveKey(w.id)}:corrupt:555`, z.unknown())).toEqual(raw)
    expect(await loadGameData(saveKey(w.id), z.unknown())).toEqual(raw)
  })

  it('keeps saves of different worlds apart', async () => {
    const a = world('wa')
    const b = world('wb')
    await writeSave(toSave({ ...createSession(a), playTimeMs: 1 }, null, 0, 1))
    await writeSave(toSave({ ...createSession(b), playTimeMs: 2 }, null, 0, 2))
    const ra = await loadSave(a)
    const rb = await loadSave(b)
    expect(ra.status === 'ok' && ra.save.playTimeMs).toBe(1)
    expect(rb.status === 'ok' && rb.save.playTimeMs).toBe(2)
  })

  it('falls back to defaults per bad settings field', async () => {
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS)
    await writeSettings({ ...DEFAULT_SETTINGS, sfxVolume: 0.2 })
    expect((await loadSettings()).sfxVolume).toBe(0.2)
    await saveGameData('adventure:settings', { ...DEFAULT_SETTINGS, lookSensitivity: 9, invertY: true })
    const s = await loadSettings()
    expect(s.lookSensitivity).toBe(1)
    expect(s.invertY).toBe(true)
  })
})
