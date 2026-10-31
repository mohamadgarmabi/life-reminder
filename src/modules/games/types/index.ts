type SudokuDifficulty = 'easy' | 'medium' | 'hard'

type SudokuPuzzle = {
  /** 81 cells, row-major; 0 = empty. */
  givens: number[]
  solution: number[]
}

type SudokuProgress = {
  level: number
  unlocked: number
  board: number[]
}

type SudokuBoardProps = {
  board: number[]
  givens: number[]
  solution: number[]
  selected: number | null
  onSelect: (index: number) => void
}

type Match3Tile = { id: number; kind: number }

/** 64 cells, row-major; null only transiently while resolving. */
type Match3Grid = (Match3Tile | null)[]

type Match3LevelConfig = { level: number; moves: number; target: number; kinds: number }

type Match3BoardProps = {
  grid: Match3Grid
  clearing: Set<number>
  spawned: Set<number>
  selected: number | null
  busy: boolean
  onTap: (index: number) => void
  onSwap: (a: number, b: number) => void
}

type Match3LevelItem = {
  level: number
  label: string
  locked: boolean
  ariaLabel: string
  bestLabel: string | null
  variant: 'ghost' | 'secondary' | 'outline'
}

type Match3Progress = {
  unlocked: number
  best: Record<string, number>
}

export type {
  SudokuDifficulty,
  SudokuPuzzle,
  SudokuProgress,
  SudokuBoardProps,
  Match3Tile,
  Match3Grid,
  Match3LevelConfig,
  Match3Progress,
  Match3BoardProps,
  Match3LevelItem,
}
