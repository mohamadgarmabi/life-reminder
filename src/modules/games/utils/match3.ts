import type { Match3Grid, Match3LevelConfig, Match3Tile } from '#/modules/games/types'
import { shuffle } from '#/modules/games/utils/sudoku'

const SIZE = 8
const MATCH3_LEVELS = 100

const levelConfig = (level: number): Match3LevelConfig => {
  const t = (level - 1) / (MATCH3_LEVELS - 1)
  return {
    level,
    moves: Math.round(25 - 10 * t),
    target: Math.round((800 + 700 * t) / 10) * 10,
    kinds: level <= 30 ? 5 : 6,
  }
}

const kindAt = (grid: Match3Grid, i: number) => grid[i]?.kind ?? -1

/** Indices of every tile in a horizontal or vertical run of 3+. */
const findMatches = (grid: Match3Grid): Set<number> => {
  const matched = new Set<number>()
  const scan = (start: (line: number) => number, step: number) => {
    for (let line = 0; line < SIZE; line++) {
      let run = 1
      for (let k = 1; k <= SIZE; k++) {
        const prev = start(line) + (k - 1) * step
        const same = k < SIZE && kindAt(grid, prev + step) !== -1 && kindAt(grid, prev + step) === kindAt(grid, prev)
        if (same) {
          run++
          continue
        }
        if (run >= 3) for (let j = 0; j < run; j++) matched.add(prev - j * step)
        run = 1
      }
    }
  }
  scan((r) => r * SIZE, 1)
  scan((c) => c, SIZE)
  return matched
}

const swapCells = (grid: Match3Grid, a: number, b: number): Match3Grid => {
  const next = [...grid]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}

const isAdjacent = (a: number, b: number) =>
  (Math.abs(a - b) === 1 && Math.floor(a / SIZE) === Math.floor(b / SIZE)) || Math.abs(a - b) === SIZE

const hasValidMove = (grid: Match3Grid) => {
  for (let i = 0; i < SIZE * SIZE; i++) {
    for (const j of [i + 1, i + SIZE]) {
      if (j < SIZE * SIZE && isAdjacent(i, j) && findMatches(swapCells(grid, i, j)).size > 0) return true
    }
  }
  return false
}

const createIdSource = (start = 1) => {
  let next = start
  return () => next++
}

// Picks a kind that doesn't complete a run of 3 with the two tiles to the left or above.
const safeKind = (grid: Match3Grid, i: number, kinds: number, rand: () => number) => {
  const r = Math.floor(i / SIZE)
  const c = i % SIZE
  const banned = new Set<number>()
  if (c >= 2 && kindAt(grid, i - 1) === kindAt(grid, i - 2)) banned.add(kindAt(grid, i - 1))
  if (r >= 2 && kindAt(grid, i - SIZE) === kindAt(grid, i - 2 * SIZE)) banned.add(kindAt(grid, i - SIZE))
  const options = [...Array(kinds).keys()].filter((k) => !banned.has(k))
  return options[Math.floor(rand() * options.length)]
}

/** A board with no ready-made matches and at least one valid move. */
const createBoard = (kinds: number, rand: () => number, nextId: () => number): Match3Grid => {
  for (;;) {
    const grid: Match3Grid = []
    for (let i = 0; i < SIZE * SIZE; i++) grid.push({ id: nextId(), kind: safeKind(grid, i, kinds, rand) })
    if (hasValidMove(grid)) return grid
  }
}

/** Rearranges the same tiles until there are no matches and a valid move exists. */
const reshuffle = (grid: Match3Grid, kinds: number, rand: () => number, nextId: () => number): Match3Grid => {
  for (let attempt = 0; attempt < 50; attempt++) {
    const next = shuffle(grid, rand)
    if (findMatches(next).size === 0 && hasValidMove(next)) return next
  }
  return createBoard(kinds, rand, nextId)
}

/** Drops tiles into the gaps (null cells) and fills the top with new tiles. Returns the new tiles' ids. */
const applyGravity = (
  grid: Match3Grid,
  kinds: number,
  rand: () => number,
  nextId: () => number,
): { grid: Match3Grid; spawned: Set<number> } => {
  const next: Match3Grid = new Array(SIZE * SIZE).fill(null)
  const spawned = new Set<number>()
  for (let c = 0; c < SIZE; c++) {
    let write = SIZE - 1
    for (let r = SIZE - 1; r >= 0; r--) {
      const tile = grid[r * SIZE + c]
      if (tile) next[write-- * SIZE + c] = tile
    }
    for (; write >= 0; write--) {
      const tile: Match3Tile = { id: nextId(), kind: Math.floor(rand() * kinds) }
      spawned.add(tile.id)
      next[write * SIZE + c] = tile
    }
  }
  return { grid: next, spawned }
}

/** 10 points per cleared tile, multiplied by the cascade step. */
const scoreFor = (cleared: number, combo: number) => cleared * 10 * combo

export {
  SIZE,
  MATCH3_LEVELS,
  levelConfig,
  findMatches,
  swapCells,
  isAdjacent,
  hasValidMove,
  createIdSource,
  createBoard,
  reshuffle,
  applyGravity,
  scoreFor,
}
