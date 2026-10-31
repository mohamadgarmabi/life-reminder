import { describe, expect, it } from 'vitest'
import type { SudokuDifficulty } from '#/modules/games/types'
import { countSolutions, generateSudoku } from '#/modules/games/utils/sudoku'

const isValidSolution = (grid: number[]) => {
  const groups: number[][] = []
  for (let k = 0; k < 9; k++) {
    groups.push([...Array(9).keys()].map((j) => k * 9 + j))
    groups.push([...Array(9).keys()].map((j) => j * 9 + k))
    const r0 = Math.floor(k / 3) * 3
    const c0 = (k % 3) * 3
    groups.push([...Array(9).keys()].map((j) => (r0 + Math.floor(j / 3)) * 9 + c0 + (j % 3)))
  }
  return groups.every((g) => new Set(g.map((i) => grid[i])).size === 9 && g.every((i) => grid[i] >= 1 && grid[i] <= 9))
}

const difficulties: SudokuDifficulty[] = ['easy', 'medium', 'hard']

describe('sudoku generator', () => {
  it('is deterministic per difficulty and level', () => {
    expect(generateSudoku('medium', 42)).toEqual(generateSudoku('medium', 42))
    expect(generateSudoku('medium', 42).givens).not.toEqual(generateSudoku('medium', 43).givens)
    expect(generateSudoku('easy', 7).givens).not.toEqual(generateSudoku('hard', 7).givens)
  })

  it.each(difficulties)('%s: valid solution, consistent givens, unique solution', (d) => {
    for (const level of [1, 500, 1000]) {
      const { givens, solution } = generateSudoku(d, level)
      expect(isValidSolution(solution)).toBe(true)
      givens.forEach((v, i) => v && expect(v).toBe(solution[i]))
      expect(countSolutions(givens)).toBe(1)
    }
  })

  it('removes more clues on harder difficulties', () => {
    const clues = (d: SudokuDifficulty) => generateSudoku(d, 3).givens.filter(Boolean).length
    expect(clues('easy')).toBe(40)
    expect(clues('medium')).toBeLessThan(clues('easy'))
    expect(clues('hard')).toBeLessThan(clues('medium'))
  })

  it('counts multiple solutions on an empty grid', () => {
    expect(countSolutions(new Array(81).fill(0))).toBe(2)
  })

  it('generates fast', () => {
    let worst = 0
    for (let level = 1; level <= 20; level++) {
      const start = performance.now()
      generateSudoku('hard', level)
      worst = Math.max(worst, performance.now() - start)
    }
    expect(worst).toBeLessThan(300)
  })
})
