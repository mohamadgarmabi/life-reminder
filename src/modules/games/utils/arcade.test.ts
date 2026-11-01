import { describe, expect, it } from 'vitest'
import { COLS, ROWS, clearLines, emptyBoard, fits, rotatePiece, spawnPiece } from '#/modules/games/utils/blocks'
import { bestColumn, dropDisc, emptyConnect, outcome } from '#/modules/games/utils/connect4'
import { canMove, slideTiles, spawnTile, type MergeTile } from '#/modules/games/utils/merge'
import { isCleared, plantMines, revealCell } from '#/modules/games/utils/mines'
import { createRunner, jump, moveLane, runnerScore, stepRunner, type Runner } from '#/modules/games/utils/runner'
import { createSnake, stepSnake, turnSnake } from '#/modules/games/utils/snake'
import { generateWater, isSorted, pour, solvable } from '#/modules/games/utils/water'

describe('snake', () => {
  it('moves, ignores reversing, eats and dies on walls', () => {
    let s = createSnake(10, () => 0)
    s = turnSnake(s, { x: -1, y: 0 })
    expect(s.queue).toHaveLength(0)
    s = { ...s, food: { x: 6, y: 5 } }
    s = stepSnake(s, () => 0)
    expect(s.score).toBe(1)
    expect(s.body).toHaveLength(4)
    for (let i = 0; i < 10; i++) s = stepSnake(s, () => 0.99)
    expect(s.alive).toBe(false)
  })
})

describe('blocks', () => {
  it('clears full rows and keeps the rest', () => {
    const board = emptyBoard()
    for (let c = 0; c < COLS; c++) board[(ROWS - 1) * COLS + c] = 1
    board[(ROWS - 2) * COLS] = 2
    const { board: next, cleared } = clearLines(board)
    expect(cleared).toBe(1)
    expect(next[(ROWS - 1) * COLS]).toBe(2)
    expect(next.filter(Boolean)).toHaveLength(1)
  })

  it('kicks off the wall when rotating', () => {
    const board = emptyBoard()
    const bar = { ...rotatePiece(board, spawnPiece(0)), x: -2 }
    expect(fits(board, bar.cells, bar.x, bar.y)).toBe(true)
    const turned = rotatePiece(board, bar)
    expect(turned.cells).not.toEqual(bar.cells)
    expect(fits(board, turned.cells, turned.x, turned.y)).toBe(true)
  })
})

describe('merge', () => {
  const tile = (id: number, value: number, r: number, c: number): MergeTile => ({ id, value, r, c })
  it('merges each pair once per move', () => {
    const { tiles, gained, moved } = slideTiles(
      [tile(1, 2, 0, 0), tile(2, 2, 0, 1), tile(3, 4, 0, 2), tile(4, 4, 0, 3)],
      'left',
    )
    const live = tiles.filter((t) => !t.gone)
    expect(moved).toBe(true)
    expect(gained).toBe(12)
    expect(live.map((t) => [t.value, t.c])).toEqual([
      [4, 0],
      [8, 1],
    ])
  })
  it('detects a stuck board', () => {
    let tiles: MergeTile[] = []
    for (let i = 0; i < 16; i++) tiles.push(tile(i, (i + Math.floor(i / 4)) % 2 ? 2 : 4, Math.floor(i / 4), i % 4))
    expect(canMove(tiles)).toBe(false)
    tiles = spawnTile([], 1, () => 0)
    expect(tiles).toHaveLength(1)
  })
})

describe('mines', () => {
  it('keeps the first tap safe and floods open', () => {
    const field = plantMines(9, 9, 10, 40, Math.random)
    expect(field.filter((c) => c.mine)).toHaveLength(10)
    const opened = revealCell(field, 9, 9, 40)
    expect(opened[40].open).toBe(true)
    expect(opened[40].adj).toBe(0)
    expect(opened.filter((c) => c.open).length).toBeGreaterThan(1)
    expect(isCleared(field.map((c) => ({ ...c, open: !c.mine })))).toBe(true)
  })
})

describe('water', () => {
  it('pours the whole top run that fits', () => {
    expect(pour([[0, 1, 1], [2, 1], []], 0, 1)).toEqual([[0], [2, 1, 1, 1], []])
    expect(pour([[0, 1, 1], [2, 2, 1], []], 0, 1)).toEqual([[0, 1], [2, 2, 1, 1], []])
    expect(pour([[0, 1], [2], []], 0, 1)).toEqual([[0, 1], [2], []])
  })
  it('generates solvable, deterministic levels', () => {
    const level = generateWater(4)
    expect(generateWater(4)).toEqual(level)
    expect(isSorted(level)).toBe(false)
    expect(solvable(level)).toBe(true)
  })
})

describe('connect four', () => {
  it('takes a winning move and blocks one', () => {
    let board = emptyConnect()
    for (const c of [0, 1, 2]) board = dropDisc(board, c, 2)!
    expect(bestColumn(board, 2)).toBe(3)
    board = emptyConnect()
    for (const c of [0, 1, 2]) board = dropDisc(board, c, 1)!
    expect(bestColumn(board, 4)).toBe(3)
    expect(outcome(dropDisc(board, 3, 1)!)).toBe(1)
  })
})

describe('runner', () => {
  const at = (kind: 'low' | 'high' | 'orb', lane: number, z: number) => ({ active: true, kind, lane, z })
  const run = (r: Runner, seconds: number) => {
    for (let t = 0; t < seconds; t += 1 / 60) stepRunner(r, 1 / 60, () => 0.99)
  }

  it('crashes into a tall block in its lane but not in another', () => {
    const r = createRunner()
    r.nextRow = 1e9
    r.things[0] = at('high', 1, -5)
    r.things[1] = at('high', 0, -5)
    run(r, 0.5)
    expect(r.alive).toBe(false)
    const s = createRunner()
    s.nextRow = 1e9
    s.things[0] = at('high', 0, -5)
    run(s, 0.6)
    expect(s.alive).toBe(true)
  })

  it('jumps over a low barrier and collects orbs', () => {
    const r = createRunner()
    r.nextRow = 1e9
    r.things[0] = at('low', 1, -4)
    r.things[1] = at('orb', 1, -9)
    stepRunner(r, 1 / 60)
    jump(r)
    run(r, 0.25)
    expect(r.alive).toBe(true)
    run(r, 0.6)
    expect(r.alive).toBe(true)
    expect(r.orbs).toBe(1)
    expect(runnerScore(r)).toBeGreaterThan(10)
  })

  it('keeps the lane in bounds and always leaves a free lane', () => {
    const r = createRunner()
    moveLane(r, 1)
    moveLane(r, 1)
    expect(r.lane).toBe(2)
    // Real randomness, collisions ignored: only the spawn pattern matters here.
    for (let t = 0; t < 20; t += 1 / 60) {
      r.alive = true
      stepRunner(r, 1 / 60)
    }
    expect(r.things.some((x) => x.active && x.kind !== 'orb')).toBe(true)
    const rows = new Map<number, Set<number>>()
    for (const t of r.things.filter((x) => x.active && x.kind !== 'orb'))
      rows.set(Math.round(t.z), (rows.get(Math.round(t.z)) ?? new Set()).add(t.lane))
    for (const lanes of rows.values()) expect(lanes.size).toBeLessThan(3)
  })
})
