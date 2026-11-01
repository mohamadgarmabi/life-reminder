type Point = { x: number; y: number }

type SnakeState = {
  size: number
  /** Head first. */
  body: Point[]
  dir: Point
  /** Buffered turns, so two quick swipes inside one tick both count. */
  queue: Point[]
  food: Point
  score: number
  alive: boolean
}

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y

const placeFood = (size: number, body: Point[], rand: () => number): Point | null => {
  const free: Point[] = []
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) if (!body.some((p) => p.x === x && p.y === y)) free.push({ x, y })
  return free.length ? free[Math.floor(rand() * free.length)] : null
}

const createSnake = (size: number, rand = Math.random): SnakeState => {
  const mid = Math.floor(size / 2)
  const body = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ]
  return { size, body, dir: { x: 1, y: 0 }, queue: [], food: placeFood(size, body, rand)!, score: 0, alive: true }
}

const turnSnake = (s: SnakeState, d: Point): SnakeState => {
  const last = s.queue.at(-1) ?? s.dir
  if ((last.x === -d.x && last.y === -d.y) || same(last, d) || s.queue.length >= 3) return s
  return { ...s, queue: [...s.queue, d] }
}

const stepSnake = (s: SnakeState, rand = Math.random): SnakeState => {
  if (!s.alive) return s
  const [dir = s.dir, ...queue] = s.queue
  const head = { x: s.body[0].x + dir.x, y: s.body[0].y + dir.y }
  const ate = same(head, s.food)
  const rest = ate ? s.body : s.body.slice(0, -1)
  const out = head.x < 0 || head.y < 0 || head.x >= s.size || head.y >= s.size
  if (out || rest.some((p) => same(p, head))) return { ...s, dir, queue, alive: false }
  const body = [head, ...rest]
  if (!ate) return { ...s, body, dir, queue }
  const food = placeFood(s.size, body, rand)
  // A full board is a win; ending the run is the simplest honest outcome.
  return { ...s, body, dir, queue, score: s.score + 1, food: food ?? s.food, alive: food !== null }
}

export { createSnake, turnSnake, stepSnake }
export type { Point, SnakeState }
