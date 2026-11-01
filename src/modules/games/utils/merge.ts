const N = 4

type MergeTile = {
  id: number
  value: number
  r: number
  c: number
  /** Consumed by a merge: drawn sliding into its partner, dropped on the next move. */
  gone?: boolean
  merged?: boolean
  fresh?: boolean
}

type Direction = 'left' | 'right' | 'up' | 'down'

const cellOf = (dir: Direction, line: number, j: number): [number, number] =>
  dir === 'left' ? [line, j] : dir === 'right' ? [line, N - 1 - j] : dir === 'up' ? [j, line] : [N - 1 - j, line]

const slideTiles = (tiles: MergeTile[], dir: Direction) => {
  const live = tiles.filter((t) => !t.gone)
  const out: MergeTile[] = []
  let moved = false
  let gained = 0
  for (let line = 0; line < N; line++) {
    let target = 0
    let last: MergeTile | null = null
    for (let j = 0; j < N; j++) {
      const [r, c] = cellOf(dir, line, j)
      const t = live.find((x) => x.r === r && x.c === c)
      if (!t) continue
      if (last && !last.merged && last.value === t.value) {
        out.push({ ...t, r: last.r, c: last.c, gone: true, merged: false, fresh: false })
        last.value *= 2
        last.merged = true
        gained += last.value
        moved = true
        continue
      }
      const [tr, tc] = cellOf(dir, line, target++)
      if (tr !== r || tc !== c) moved = true
      last = { ...t, r: tr, c: tc, merged: false, fresh: false }
      out.push(last)
    }
  }
  return { tiles: out, moved, gained }
}

const spawnTile = (tiles: MergeTile[], id: number, rand = Math.random): MergeTile[] => {
  const live = tiles.filter((t) => !t.gone)
  const free: [number, number][] = []
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) if (!live.some((t) => t.r === r && t.c === c)) free.push([r, c])
  if (!free.length) return tiles
  const [r, c] = free[Math.floor(rand() * free.length)]
  return [...tiles, { id, value: rand() < 0.9 ? 2 : 4, r, c, fresh: true }]
}

const canMove = (tiles: MergeTile[]) => {
  const live = tiles.filter((t) => !t.gone)
  if (live.length < N * N) return true
  return live.some((t) => live.some((o) => o.value === t.value && Math.abs(o.r - t.r) + Math.abs(o.c - t.c) === 1))
}

export { N as MERGE_SIZE, slideTiles, spawnTile, canMove }
export type { MergeTile, Direction }
