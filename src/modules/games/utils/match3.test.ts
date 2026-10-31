import { describe, expect, it } from 'vitest'
import type { Match3Grid } from '#/modules/games/types'
import {
  SIZE,
  applyGravity,
  createBoard,
  createIdSource,
  findMatches,
  hasValidMove,
  levelConfig,
  reshuffle,
} from '#/modules/games/utils/match3'
import { mulberry32 } from '#/modules/games/utils/sudoku'

// Kinds as an 8x8 string ('.' = empty) → grid.
const parse = (rows: string[]): Match3Grid =>
  rows
    .join('')
    .split('')
    .map((ch, i) => (ch === '.' ? null : { id: i + 1, kind: Number(ch) }))

// Checkerboard-ish pattern with no runs and no possible swap-match.
const dead = ['01230123', '23012301', '01230123', '23012301', '01230123', '23012301', '01230123', '23012301']

describe('match3', () => {
  it('finds horizontal and vertical runs of 3+', () => {
    const grid = parse(['00012301', ...dead.slice(1, 3), '13012301', '11230123', '13012301', ...dead.slice(6)])
    expect([...findMatches(grid)].sort((a, b) => a - b)).toEqual([0, 1, 2, 24, 32, 40])
    expect(findMatches(parse(dead)).size).toBe(0)
  })

  it('ignores empty cells', () => {
    expect(findMatches(parse(['...12301', ...dead.slice(1)])).size).toBe(0)
  })

  it('detects valid moves', () => {
    expect(hasValidMove(parse(dead))).toBe(false)
    // swapping cells 2 and 3 lines up three 0s
    expect(hasValidMove(parse(['00102301', ...dead.slice(1)]))).toBe(true)
  })

  it('drops tiles and refills from the top', () => {
    const grid = parse(dead)
    const above = grid[0]
    grid[8] = null
    grid[16] = null
    const { grid: next, spawned } = applyGravity(grid, 5, mulberry32(1), createIdSource(1000))
    expect(next.every(Boolean)).toBe(true)
    expect(spawned.size).toBe(2)
    expect(next[16]).toBe(above)
    expect(spawned.has(next[0]!.id) && spawned.has(next[8]!.id)).toBe(true)
  })

  it('creates boards with no matches and a valid move', () => {
    const rand = mulberry32(7)
    const nextId = createIdSource()
    for (let n = 0; n < 50; n++) {
      const grid = createBoard(n % 2 ? 6 : 5, rand, nextId)
      expect(grid).toHaveLength(SIZE * SIZE)
      expect(findMatches(grid).size).toBe(0)
      expect(hasValidMove(grid)).toBe(true)
      expect(new Set(grid.map((t) => t!.id)).size).toBe(SIZE * SIZE)
    }
  })

  it('reshuffles a dead board into a playable one', () => {
    const grid = reshuffle(parse(dead), 4, mulberry32(3), createIdSource(1000))
    expect(findMatches(grid).size).toBe(0)
    expect(hasValidMove(grid)).toBe(true)
  })

  it('scales level difficulty', () => {
    expect(levelConfig(1)).toMatchObject({ moves: 25, kinds: 5 })
    expect(levelConfig(100)).toMatchObject({ moves: 15, kinds: 6 })
    expect(levelConfig(100).target).toBeGreaterThan(levelConfig(1).target)
  })
})
