type MineCell = { mine: boolean; adj: number; open: boolean; flag: boolean }

const neighbors = (i: number, rows: number, cols: number) => {
  const r = Math.floor(i / cols)
  const c = i % cols
  const out: number[] = []
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr
      const nc = c + dc
      if ((dr || dc) && nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc)
    }
  return out
}

const blankField = (rows: number, cols: number): MineCell[] =>
  Array.from({ length: rows * cols }, () => ({ mine: false, adj: 0, open: false, flag: false }))

/** Mines placed after the first tap, never on it or around it, so the first tap always opens an area. */
const plantMines = (rows: number, cols: number, mines: number, safe: number, rand = Math.random) => {
  const banned = new Set([safe, ...neighbors(safe, rows, cols)])
  const spots = [...Array(rows * cols).keys()].filter((i) => !banned.has(i))
  for (let i = spots.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[spots[i], spots[j]] = [spots[j], spots[i]]
  }
  const field = blankField(rows, cols)
  for (const i of spots.slice(0, mines)) field[i].mine = true
  field.forEach((cell, i) => (cell.adj = neighbors(i, rows, cols).filter((n) => field[n].mine).length))
  return field
}

/** Opens a cell; empty areas flood open. Returns a new field. */
const revealCell = (field: MineCell[], rows: number, cols: number, start: number) => {
  const next = field.map((c) => ({ ...c }))
  const stack = [start]
  while (stack.length) {
    const i = stack.pop()!
    const cell = next[i]
    if (cell.open || cell.flag) continue
    cell.open = true
    if (!cell.mine && cell.adj === 0) stack.push(...neighbors(i, rows, cols))
  }
  return next
}

const isCleared = (field: MineCell[]) => field.every((c) => c.mine || c.open)

export { blankField, plantMines, revealCell, isCleared, neighbors }
export type { MineCell }
