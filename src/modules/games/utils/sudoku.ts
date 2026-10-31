import type { SudokuDifficulty, SudokuPuzzle } from '#/modules/games/types'

const SUDOKU_LEVELS = 1000
const CLUE_TARGET: Record<SudokuDifficulty, number> = { easy: 40, medium: 32, hard: 26 }

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// FNV-1a: turns "difficulty:level" into a 32-bit seed.
const hashSeed = (s: string) => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193)
  return h >>> 0
}

const shuffle = <T>(items: T[], rand: () => number): T[] => {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Rows (or cols) shuffled within their band, and the bands themselves shuffled.
const shuffledLines = (rand: () => number) =>
  shuffle([0, 1, 2], rand).flatMap((band) => shuffle([0, 1, 2], rand).map((r) => band * 3 + r))

const generateSolution = (rand: () => number): number[] => {
  const rows = shuffledLines(rand)
  const cols = shuffledLines(rand)
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rand)
  const pattern = (r: number, c: number) => (3 * (r % 3) + Math.floor(r / 3) + c) % 9
  return Array.from({ length: 81 }, (_, i) => digits[pattern(rows[Math.floor(i / 9)], cols[i % 9])])
}

const boxOf = (i: number) => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)

const popcount = (n: number) => {
  let c = 0
  for (; n; n &= n - 1) c++
  return c
}

/** Counts solutions of `grid` (0 = empty), stopping once `limit` is reached. */
const countSolutions = (grid: number[], limit = 2): number => {
  const rows = new Array(9).fill(0)
  const cols = new Array(9).fill(0)
  const boxes = new Array(9).fill(0)
  const empty: number[] = []
  for (let i = 0; i < 81; i++) {
    const v = grid[i]
    if (!v) {
      empty.push(i)
      continue
    }
    const bit = 1 << v
    const r = Math.floor(i / 9)
    const c = i % 9
    const b = boxOf(i)
    if ((rows[r] | cols[c] | boxes[b]) & bit) return 0
    rows[r] |= bit
    cols[c] |= bit
    boxes[b] |= bit
  }

  let count = 0
  const search = (depth: number) => {
    if (depth === empty.length) {
      count++
      return
    }
    // MRV: move the most constrained empty cell to position `depth`.
    let best = depth
    let bestFree = 0
    let bestCount = 10
    for (let k = depth; k < empty.length; k++) {
      const i = empty[k]
      const free = ~(rows[Math.floor(i / 9)] | cols[i % 9] | boxes[boxOf(i)]) & 0x3fe
      const n = popcount(free)
      if (n < bestCount) {
        best = k
        bestFree = free
        bestCount = n
        if (n <= 1) break
      }
    }
    if (bestCount === 0) return
    ;[empty[depth], empty[best]] = [empty[best], empty[depth]]
    const i = empty[depth]
    const r = Math.floor(i / 9)
    const c = i % 9
    const b = boxOf(i)
    for (let free = bestFree; free && count < limit; free &= free - 1) {
      const bit = free & -free
      rows[r] |= bit
      cols[c] |= bit
      boxes[b] |= bit
      search(depth + 1)
      rows[r] &= ~bit
      cols[c] &= ~bit
      boxes[b] &= ~bit
    }
    ;[empty[depth], empty[best]] = [empty[best], empty[depth]]
  }
  search(0)
  return count
}

/** Level N of a difficulty is always the same puzzle (seeded by both). */
const generateSudoku = (difficulty: SudokuDifficulty, level: number): SudokuPuzzle => {
  const rand = mulberry32(hashSeed(`sudoku:${difficulty}:${level}`))
  const solution = generateSolution(rand)
  const givens = [...solution]
  let clues = 81
  for (const i of shuffle([...Array(81).keys()], rand)) {
    if (clues <= CLUE_TARGET[difficulty]) break
    const v = givens[i]
    givens[i] = 0
    if (countSolutions(givens) === 1) clues--
    else givens[i] = v
  }
  return { givens, solution }
}

/** Whether cells a and b share a row, column or box. */
const isPeer = (a: number, b: number) =>
  Math.floor(a / 9) === Math.floor(b / 9) || a % 9 === b % 9 || boxOf(a) === boxOf(b)

export { SUDOKU_LEVELS, CLUE_TARGET, mulberry32, hashSeed, shuffle, countSolutions, generateSudoku, isPeer }
