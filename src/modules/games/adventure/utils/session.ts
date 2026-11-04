import type { AdventureWorld, SaveGame, Session, Vec3 } from '#/modules/games/adventure/types'

// Pure session rules: no timers, randomness or I/O, so every game rule is unit-testable.

const SAVE_VERSION = 1

const createSession = (world: AdventureWorld, save?: SaveGame): Session => {
  const puzzles: Record<string, unknown> = {}
  for (const [id, def] of Object.entries(world.puzzles)) {
    const parsed = def.schema.safeParse(save?.puzzles[id])
    puzzles[id] = parsed.success ? parsed.data : def.initial
  }
  const known = (ids: string[], pool: Record<string, unknown>) => [...new Set(ids)].filter((id) => id in pool)
  return {
    worldId: world.id,
    checkpointId: save && save.checkpointId in world.checkpoints ? save.checkpointId : 'start',
    inventory: known(save?.inventory ?? [], world.items),
    puzzles,
    secrets: known(save?.secrets ?? [], world.secrets),
    playTimeMs: Math.max(0, save?.playTimeMs ?? 0),
    completed: save?.completed ?? false,
  }
}

const hasItem = (s: Session, itemId: string) => s.inventory.includes(itemId)

const addItem = (s: Session, itemId: string): Session =>
  hasItem(s, itemId) ? s : { ...s, inventory: [...s.inventory, itemId] }

const isPuzzleSolved = (s: Session, world: AdventureWorld, puzzleId: string) =>
  world.puzzles[puzzleId].isSolved(s.puzzles[puzzleId])

/** Runs the puzzle's pure rule; a newly solved puzzle grants its reward exactly once. */
const dispatchPuzzle = (s: Session, world: AdventureWorld, puzzleId: string, action: unknown): Session => {
  const def = world.puzzles[puzzleId]
  const before = s.puzzles[puzzleId]
  if (def.isSolved(before)) return s
  const after = def.apply(before, action, { has: (id) => hasItem(s, id) })
  let next: Session = { ...s, puzzles: { ...s.puzzles, [puzzleId]: after } }
  if (def.isSolved(after)) {
    const take = new Set(def.reward?.take ?? [])
    next = { ...next, inventory: next.inventory.filter((id) => !take.has(id)) }
    for (const id of def.reward?.give ?? []) next = addItem(next, id)
  }
  return next
}

const recordSecret = (s: Session, secretId: string): Session =>
  s.secrets.includes(secretId) ? s : { ...s, secrets: [...s.secrets, secretId] }

const reachCheckpoint = (s: Session, checkpointId: string): Session =>
  s.checkpointId === checkpointId ? s : { ...s, checkpointId }

const isObjectiveUnlocked = (s: Session, world: AdventureWorld) =>
  world.objective.requires.every((id) => isPuzzleSolved(s, world, id))

const toSave = (s: Session, position: Vec3 | null, yaw: number, now: number): SaveGame => ({
  ...s,
  version: SAVE_VERSION,
  position,
  yaw,
  savedAt: now,
})

const summary = (s: Session, world: AdventureWorld) => {
  const journals = Object.values(world.items).filter((i) => i.kind === 'journal')
  return {
    playTimeMs: s.playTimeMs,
    journals: [journals.filter((j) => hasItem(s, j.id)).length, journals.length] as const,
    secrets: [s.secrets.length, Object.keys(world.secrets).length] as const,
  }
}

export {
  SAVE_VERSION,
  createSession,
  hasItem,
  addItem,
  isPuzzleSolved,
  dispatchPuzzle,
  recordSecret,
  reachCheckpoint,
  isObjectiveUnlocked,
  toSave,
  summary,
}
