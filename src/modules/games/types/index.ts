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

type ScoreEntry = { score: number; at: number }

type GameStatus = 'ready' | 'playing' | 'paused' | 'over'

type CanvasPalette = { bg: string; fg: string; muted: string; line: string; dark: boolean }

type GameCategory = 'arcade' | '3d' | 'puzzle' | 'board'

type GameEntry = {
  id: string
  title: string
  description: string
  category: GameCategory
  /** Emoji badge; tint is a Tailwind background class. */
  emoji: string
  tint: string
}

type GameOverlay = {
  title: string
  detail?: string
  action: string
  /** Defaults to the shell's onRestart. */
  onAction?: () => void
  /** Also offer "restart" next to a custom action (e.g. resume). */
  restart?: boolean
}

export type {
  ScoreEntry,
  GameStatus,
  CanvasPalette,
  GameCategory,
  GameEntry,
  GameOverlay,
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
