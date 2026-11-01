const COLS = 7
const ROWS = 6
const WIN_LINES: number[][] = []
for (let r = 0; r < ROWS; r++)
  for (let c = 0; c < COLS; c++)
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ]) {
      const line = [0, 1, 2, 3].map((k) => [r + dr * k, c + dc * k])
      if (line.every(([lr, lc]) => lr >= 0 && lr < ROWS && lc >= 0 && lc < COLS))
        WIN_LINES.push(line.map(([lr, lc]) => lr * COLS + lc))
    }

/** 42 cells, row 0 at the top; 0 empty, 1 player, 2 computer. */
type Board = number[]

const emptyConnect = (): Board => new Array<number>(ROWS * COLS).fill(0)

/** Lowest empty row in a column, or -1 when full. */
const landingRow = (board: Board, col: number) => {
  for (let r = ROWS - 1; r >= 0; r--) if (board[r * COLS + col] === 0) return r
  return -1
}

const dropDisc = (board: Board, col: number, who: number): Board | null => {
  const r = landingRow(board, col)
  if (r < 0) return null
  const next = [...board]
  next[r * COLS + col] = who
  return next
}

/** 1 or 2 for a winner, 3 for a draw, 0 while playing. */
const outcome = (board: Board) => {
  for (const line of WIN_LINES) {
    const v = board[line[0]]
    if (v && line.every((i) => board[i] === v)) return v
  }
  return board.every((v) => v !== 0) ? 3 : 0
}

const winningLine = (board: Board) =>
  WIN_LINES.find((line) => board[line[0]] && line.every((i) => board[i] === board[line[0]])) ?? null

const evaluate = (board: Board) => {
  let score = 0
  for (const line of WIN_LINES) {
    let ai = 0
    let me = 0
    for (const i of line) {
      if (board[i] === 2) ai++
      else if (board[i] === 1) me++
    }
    if (me === 0) score += [0, 1, 5, 50][ai] ?? 0
    if (ai === 0) score -= [0, 1, 6, 60][me] ?? 0
  }
  for (let r = 0; r < ROWS; r++) score += board[r * COLS + 3] === 2 ? 3 : 0
  return score
}

const ORDER = [3, 2, 4, 1, 5, 0, 6]

const search = (board: Board, depth: number, alpha: number, beta: number, aiTurn: boolean): number => {
  const result = outcome(board)
  if (result === 2) return 100000 + depth
  if (result === 1) return -100000 - depth
  if (result === 3) return 0
  if (depth === 0) return evaluate(board)
  let best = aiTurn ? -Infinity : Infinity
  for (const col of ORDER) {
    const next = dropDisc(board, col, aiTurn ? 2 : 1)
    if (!next) continue
    const v = search(next, depth - 1, alpha, beta, !aiTurn)
    if (aiTurn) {
      best = Math.max(best, v)
      alpha = Math.max(alpha, v)
    } else {
      best = Math.min(best, v)
      beta = Math.min(beta, v)
    }
    if (alpha >= beta) break
  }
  return best
}

/** Computer's column: alpha-beta search; depth sets the difficulty. */
const bestColumn = (board: Board, depth: number) => {
  let bestCol = -1
  let bestScore = -Infinity
  for (const col of ORDER) {
    const next = dropDisc(board, col, 2)
    if (!next) continue
    const v = search(next, depth - 1, -Infinity, Infinity, false)
    if (v > bestScore) {
      bestScore = v
      bestCol = col
    }
  }
  return bestCol
}

export { COLS as C4_COLS, ROWS as C4_ROWS, emptyConnect, landingRow, dropDisc, outcome, winningLine, bestColumn }
export type { Board }
