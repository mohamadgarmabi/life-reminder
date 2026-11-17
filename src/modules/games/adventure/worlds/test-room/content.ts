import { z } from 'zod'
import type { AdventureWorld, PuzzleDef } from '#/modules/games/adventure/types'

/** Lever: pulling it with the key opens the exit. */
const lever: PuzzleDef<{ pulled: boolean }, 'pull'> = {
  id: 'lever',
  schema: z.object({ pulled: z.boolean() }),
  initial: { pulled: false },
  apply: (s, _a, ctx) => (ctx.has('key') ? { pulled: true } : s),
  isSolved: (s) => s.pulled,
  reward: { take: ['key'] },
}

const TEST_ROOM_DATA: Omit<AdventureWorld, 'Scene'> = {
  id: 'test-room',
  title: 'adventure.testRoom.title',
  description: 'adventure.testRoom.description',
  items: {
    key: {
      id: 'key',
      kind: 'tool',
      name: 'adventure.testRoom.key.name',
      description: 'adventure.testRoom.key.description',
      icon: '🗝️',
    },
  },
  puzzles: { lever },
  checkpoints: { start: { id: 'start', position: [0, 1.2, 6], yaw: 0 } },
  secrets: {},
  objective: { requires: ['lever'], trigger: 'reach' },
  hints: { start: 'adventure.testRoom.hint.start' },
  killY: -10,
}

export { TEST_ROOM_DATA }
