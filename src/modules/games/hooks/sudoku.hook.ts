import { useState } from 'react'
import { z } from 'zod'
import type { SudokuDifficulty, SudokuProgress, SudokuPuzzle } from '#/modules/games/types'
import { level, readGame, writeGame } from '#/modules/games/utils/storage'
import { SUDOKU_LEVELS, generateSudoku } from '#/modules/games/utils/sudoku'
import { toFaDigits } from '#/modules/shell/utils/format'

const DIFFICULTIES: { value: SudokuDifficulty; label: string }[] = [
  { value: 'easy', label: 'آسان' },
  { value: 'medium', label: 'متوسط' },
  { value: 'hard', label: 'سخت' },
]

const difficultySchema = z.enum(['easy', 'medium', 'hard'])
const progressSchema = z.object({
  level: level(SUDOKU_LEVELS),
  unlocked: level(SUDOKU_LEVELS),
  board: z.array(z.number().int().min(0).max(9)).length(81),
})

type Game = SudokuProgress & { difficulty: SudokuDifficulty; puzzle: SudokuPuzzle }

const progressKey = (d: SudokuDifficulty) => `sudoku:${d}`

const loadGame = (difficulty: SudokuDifficulty, requestedLevel?: number): Game => {
  const saved = readGame(progressKey(difficulty), progressSchema)
  const unlocked = saved?.unlocked ?? 1
  const lvl = Math.min(Math.max(requestedLevel ?? saved?.level ?? 1, 1), unlocked)
  const puzzle = generateSudoku(difficulty, lvl)
  // A saved board is only resumed if it's for this level and keeps every given intact.
  const resumable = saved?.level === lvl && puzzle.givens.every((v, i) => !v || saved.board[i] === v)
  return { difficulty, level: lvl, unlocked, puzzle, board: resumable ? saved.board : [...puzzle.givens] }
}

const saveGame = ({ difficulty, level, unlocked, board }: Game) =>
  writeGame(progressKey(difficulty), { level, unlocked, board })

const useSudoku = () => {
  const [game, setGame] = useState(() => loadGame(readGame('sudoku:difficulty', difficultySchema) ?? 'easy'))
  const [selected, setSelected] = useState<number | null>(null)
  const { difficulty, puzzle, board, unlocked } = game
  const isSolved = board.every((v, i) => v === puzzle.solution[i])

  const commit = (next: Game) => {
    saveGame(next)
    setGame(next)
  }

  const handleInput = (digit: number) => {
    if (selected === null || puzzle.givens[selected] || isSolved) return
    const nextBoard = [...board]
    nextBoard[selected] = digit
    const solved = nextBoard.every((v, i) => v === puzzle.solution[i])
    commit({
      ...game,
      board: nextBoard,
      unlocked: solved ? Math.min(Math.max(unlocked, game.level + 1), SUDOKU_LEVELS) : unlocked,
    })
  }

  const goTo = (d: SudokuDifficulty, lvl?: number) => {
    writeGame('sudoku:difficulty', d)
    const next = loadGame(d, lvl)
    saveGame(next)
    setGame(next)
    setSelected(null)
  }

  return {
    difficulties: DIFFICULTIES,
    difficulty,
    board,
    givens: puzzle.givens,
    solution: puzzle.solution,
    selected,
    isSolved,
    levelLabel: `مرحلهٔ ${toFaDigits(game.level)} از ${toFaDigits(SUDOKU_LEVELS)}`,
    hasPrev: game.level > 1,
    hasNext: game.level < unlocked,
    canGoNext: game.level < SUDOKU_LEVELS,
    handleSelect: setSelected,
    handleInput,
    handleErase: () => handleInput(0),
    handleReset: () => {
      commit({ ...game, board: [...puzzle.givens] })
      setSelected(null)
    },
    handleDifficulty: (d: SudokuDifficulty) => d !== difficulty && goTo(d),
    handlePrev: () => goTo(difficulty, game.level - 1),
    handleNext: () => goTo(difficulty, game.level + 1),
  }
}

export { useSudoku }
