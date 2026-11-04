import { describe, expect, it } from 'vitest'
import type { AdventureWorld } from '#/modules/games/adventure/types'
import {
  addItem,
  createSession,
  dispatchPuzzle,
  isObjectiveUnlocked,
  toSave,
} from '#/modules/games/adventure/utils/session'
import { loadSave, writeSave } from '#/modules/games/adventure/utils/save'
import { TEST_ROOM_DATA } from '#/modules/games/adventure/worlds/test-room/content'
import { ISLAND_DATA } from '#/modules/games/adventure/worlds/forgotten-island/content'

const room: AdventureWorld = { ...TEST_ROOM_DATA, Scene: () => null }
const island: AdventureWorld = { ...ISLAND_DATA, Scene: () => null }

describe('test room (engine reuse)', () => {
  it('completes through the shared session rules alone', () => {
    let s = createSession(room)
    s = dispatchPuzzle(s, room, 'lever', 'pull')
    expect(isObjectiveUnlocked(s, room)).toBe(false)
    s = dispatchPuzzle(addItem(s, 'key'), room, 'lever', 'pull')
    expect(isObjectiveUnlocked(s, room)).toBe(true)
    expect(s.inventory).toEqual([])
  })

  it("keeps the room's and the island's saves apart", async () => {
    await writeSave(toSave(addItem(createSession(room), 'key'), [1, 1, 1], 0, 10))
    await writeSave(toSave(addItem(createSession(island), 'journal-1'), [2, 2, 2], 0, 20))
    const r = await loadSave(room)
    const i = await loadSave(island)
    expect(r.status === 'ok' && r.save.inventory).toEqual(['key'])
    expect(i.status === 'ok' && i.save.inventory).toEqual(['journal-1'])
  })
})
