import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import type { AdventureWorld, PuzzleDef } from '#/modules/games/adventure/types'
import {
  addItem,
  createSession,
  dispatchPuzzle,
  isObjectiveUnlocked,
  recordSecret,
  summary,
  toSave,
} from '#/modules/games/adventure/utils/session'

// Lever needs the key; solving it consumes the key and gives the gem.
const lever: PuzzleDef<{ pulled: boolean }, 'pull'> = {
  id: 'lever',
  schema: z.object({ pulled: z.boolean() }),
  initial: { pulled: false },
  apply: (s, _a, ctx) => (ctx.has('key') ? { pulled: true } : s),
  isSolved: (s) => s.pulled,
  reward: { give: ['gem'], take: ['key'] },
}

const world: AdventureWorld = {
  id: 'fixture',
  title: 'fixture',
  description: '',
  items: {
    key: { id: 'key', kind: 'tool', name: 'k', description: '', icon: '🔑' },
    gem: { id: 'gem', kind: 'artifact', name: 'g', description: '', icon: '💎' },
    page: { id: 'page', kind: 'journal', name: 'p', description: '', icon: '📜', text: 't' },
  },
  puzzles: { lever },
  checkpoints: {
    start: { id: 'start', position: [0, 0, 0], yaw: 0 },
    hall: { id: 'hall', position: [1, 0, 1], yaw: 1 },
  },
  secrets: { nook: { id: 'nook', kind: 'passage' } },
  objective: { requires: ['lever'], trigger: 'reach' },
  hints: {},
  killY: -20,
  Scene: () => null,
}

describe('adventure session', () => {
  it('addItem is idempotent and keeps order', () => {
    let s = createSession(world)
    s = addItem(addItem(addItem(s, 'page'), 'key'), 'page')
    expect(s.inventory).toEqual(['page', 'key'])
  })

  it('a puzzle needing an item does nothing without it', () => {
    const s = dispatchPuzzle(createSession(world), world, 'lever', 'pull')
    expect(s.puzzles.lever).toEqual({ pulled: false })
    expect(isObjectiveUnlocked(s, world)).toBe(false)
  })

  it('grants the reward exactly once and ignores actions after solving', () => {
    let s = addItem(createSession(world), 'key')
    s = dispatchPuzzle(s, world, 'lever', 'pull')
    expect(s.inventory).toEqual(['gem'])
    s = addItem(s, 'key')
    const again = dispatchPuzzle(s, world, 'lever', 'pull')
    expect(again).toBe(s)
    expect(again.inventory).toEqual(['gem', 'key'])
    expect(isObjectiveUnlocked(again, world)).toBe(true)
  })

  it('counts journals and secrets for the summary', () => {
    let s = recordSecret(recordSecret(addItem(createSession(world), 'page'), 'nook'), 'nook')
    s = { ...s, playTimeMs: 1234 }
    expect(summary(s, world)).toEqual({ playTimeMs: 1234, journals: [1, 1], secrets: [1, 1] })
  })

  it('restores everything from a save', () => {
    let s = addItem(createSession(world), 'key')
    s = { ...recordSecret(dispatchPuzzle(s, world, 'lever', 'pull'), 'nook'), checkpointId: 'hall', playTimeMs: 99 }
    const save = toSave(s, [3, 1, 2], 0.5, 1000)
    expect(createSession(world, save)).toEqual(s)
    expect(save.position).toEqual([3, 1, 2])
    expect(toSave(s, null, 0, 1).position).toBeNull()
  })

  it('repairs bad save content without dropping the rest', () => {
    const save = toSave(addItem(createSession(world), 'key'), null, 0, 1)
    const s = createSession(world, {
      ...save,
      checkpointId: 'gone',
      inventory: ['key', 'key', 'unknown'],
      puzzles: { lever: { pulled: 'yes' } },
    })
    expect(s.checkpointId).toBe('start')
    expect(s.inventory).toEqual(['key'])
    expect(s.puzzles.lever).toEqual({ pulled: false })
  })
})
