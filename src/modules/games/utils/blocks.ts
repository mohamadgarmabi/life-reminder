const COLS = 10
const ROWS = 20

type Cells = [number, number][]
type Piece = { kind: number; cells: Cells; box: number; x: number; y: number }

// Seven four-cell shapes in their spawn box (x, y).
const SHAPES: { cells: Cells; box: number }[] = [
  {
    box: 4,
    cells: [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
  },
  {
    box: 2,
    cells: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  },
  {
    box: 3,
    cells: [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
  {
    box: 3,
    cells: [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
  },
  {
    box: 3,
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
  },
  {
    box: 3,
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
  {
    box: 3,
    cells: [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
]

/** Board: COLS*ROWS, row-major; 0 = empty, otherwise kind + 1. */
const emptyBoard = () => new Array<number>(COLS * ROWS).fill(0)

const spawnPiece = (kind: number): Piece => {
  const { cells, box } = SHAPES[kind]
  return { kind, cells, box, x: Math.floor((COLS - box) / 2), y: 0 }
}

/** Shuffled bag of all seven, so droughts of one shape can't happen. */
const newBag = (rand = Math.random) => {
  const bag = [0, 1, 2, 3, 4, 5, 6]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  return bag
}

const fits = (board: number[], cells: Cells, x: number, y: number) =>
  cells.every(([cx, cy]) => {
    const px = x + cx
    const py = y + cy
    return px >= 0 && px < COLS && py < ROWS && (py < 0 || board[py * COLS + px] === 0)
  })

const rotateCells = (cells: Cells, box: number): Cells => cells.map(([x, y]) => [box - 1 - y, x])

/** Clockwise rotation with small wall kicks; returns the same piece when nothing fits. */
const rotatePiece = (board: number[], p: Piece): Piece => {
  if (p.box === 2) return p
  const cells = rotateCells(p.cells, p.box)
  for (const dx of [0, -1, 1, -2, 2]) if (fits(board, cells, p.x + dx, p.y)) return { ...p, cells, x: p.x + dx }
  return p
}

const lockPiece = (board: number[], p: Piece) => {
  const next = [...board]
  for (const [cx, cy] of p.cells) if (p.y + cy >= 0) next[(p.y + cy) * COLS + p.x + cx] = p.kind + 1
  return next
}

const clearLines = (board: number[]) => {
  const kept: number[][] = []
  for (let r = 0; r < ROWS; r++) {
    const row = board.slice(r * COLS, (r + 1) * COLS)
    if (row.some((v) => v === 0)) kept.push(row)
  }
  const cleared = ROWS - kept.length
  const filler = Array.from({ length: cleared }, () => new Array<number>(COLS).fill(0))
  return { board: [...filler, ...kept].flat(), cleared }
}

const dropDistance = (board: number[], p: Piece) => {
  let d = 0
  while (fits(board, p.cells, p.x, p.y + d + 1)) d++
  return d
}

const LINE_POINTS = [0, 100, 300, 500, 800]

export {
  COLS,
  ROWS,
  SHAPES,
  LINE_POINTS,
  emptyBoard,
  spawnPiece,
  newBag,
  fits,
  rotatePiece,
  lockPiece,
  clearLines,
  dropDistance,
}
export type { Piece }
