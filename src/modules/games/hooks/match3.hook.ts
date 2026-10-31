import { useRef, useState } from 'react'
import { z } from 'zod'
import type { Match3Grid, Match3Progress } from '#/modules/games/types'
import {
  MATCH3_LEVELS,
  applyGravity,
  createBoard,
  createIdSource,
  findMatches,
  hasValidMove,
  isAdjacent,
  levelConfig,
  reshuffle,
  scoreFor,
  swapCells,
} from '#/modules/games/utils/match3'
import { level, readGame, writeGame } from '#/modules/games/utils/storage'
import { toFaDigits } from '#/modules/shell/utils/format'

const PROGRESS_KEY = 'match3:progress'
const progressSchema = z.object({
  unlocked: level(MATCH3_LEVELS),
  best: z.record(z.string().regex(/^\d+$/), z.number().int().min(0)),
})

const SWAP_MS = 180
const CLEAR_MS = 220
const FALL_MS = 260

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type Status = 'playing' | 'won' | 'lost'

const useMatch3 = () => {
  const [progress, setProgress] = useState<Match3Progress>(
    () => readGame(PROGRESS_KEY, progressSchema) ?? { unlocked: 1, best: {} },
  )
  const [level, setLevel] = useState<number | null>(null)
  const [grid, setGrid] = useState<Match3Grid>([])
  const [score, setScore] = useState(0)
  const [movesLeft, setMovesLeft] = useState(0)
  const [combo, setCombo] = useState(1)
  const [status, setStatus] = useState<Status>('playing')
  const [busy, setBusy] = useState(false)
  const [clearing, setClearing] = useState<Set<number>>(new Set())
  const [spawned, setSpawned] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<number | null>(null)
  const nextId = useRef(createIdSource()).current

  const config = levelConfig(level ?? 1)

  const start = (lvl: number) => {
    const cfg = levelConfig(lvl)
    setLevel(lvl)
    setGrid(createBoard(cfg.kinds, Math.random, nextId))
    setScore(0)
    setMovesLeft(cfg.moves)
    setCombo(1)
    setStatus('playing')
    setBusy(false)
    setClearing(new Set())
    setSpawned(new Set())
    setSelected(null)
  }

  const finish = (result: Status, finalScore: number) => {
    if (level === null) return
    const next: Match3Progress = {
      unlocked: result === 'won' ? Math.min(Math.max(progress.unlocked, level + 1), MATCH3_LEVELS) : progress.unlocked,
      best: { ...progress.best, [level]: Math.max(progress.best[level] ?? 0, finalScore) },
    }
    writeGame(PROGRESS_KEY, next)
    setProgress(next)
    setStatus(result)
  }

  const trySwap = async (a: number, b: number) => {
    if (busy || status !== 'playing' || !isAdjacent(a, b)) return
    setBusy(true)
    setSelected(null)
    let g = swapCells(grid, a, b)
    setGrid(g)
    await wait(SWAP_MS)
    let matches = findMatches(g)
    if (matches.size === 0) {
      setGrid(grid)
      await wait(SWAP_MS)
      setBusy(false)
      return
    }

    const moves = movesLeft - 1
    setMovesLeft(moves)
    let total = score
    for (let step = 1; matches.size > 0; step++) {
      setCombo(step)
      setClearing(new Set([...matches].map((i) => g[i]!.id)))
      await wait(CLEAR_MS)
      total += scoreFor(matches.size, step)
      setScore(total)
      const dropped = applyGravity(
        g.map((t, i) => (matches.has(i) ? null : t)),
        config.kinds,
        Math.random,
        nextId,
      )
      g = dropped.grid
      setClearing(new Set())
      setSpawned(dropped.spawned)
      setGrid(g)
      await wait(FALL_MS)
      matches = findMatches(g)
    }
    if (!hasValidMove(g)) {
      g = reshuffle(g, config.kinds, Math.random, nextId)
      setGrid(g)
    }
    setCombo(1)
    setBusy(false)
    if (total >= config.target) finish('won', total)
    else if (moves === 0) finish('lost', total)
  }

  const handleTap = (index: number) => {
    if (busy || status !== 'playing') return
    if (selected === null || selected === index) return setSelected(selected === index ? null : index)
    if (isAdjacent(selected, index)) return void trySwap(selected, index)
    setSelected(index)
  }

  return {
    level,
    levels: Array.from({ length: MATCH3_LEVELS }, (_, i) => {
      const locked = i + 1 > progress.unlocked
      const best = progress.best[i + 1]
      return {
        level: i + 1,
        label: toFaDigits(i + 1),
        locked,
        ariaLabel: `مرحلهٔ ${toFaDigits(i + 1)}${locked ? ' (قفل)' : ''}`,
        bestLabel: best ? toFaDigits(best) : null,
        variant: locked ? ('ghost' as const) : best ? ('secondary' as const) : ('outline' as const),
      }
    }),
    grid,
    clearing,
    spawned,
    selected,
    busy,
    status,
    canGoNext: level !== null && level < MATCH3_LEVELS,
    levelLabel: `مرحلهٔ ${toFaDigits(level ?? 1)}`,
    scoreLabel: toFaDigits(score),
    targetLabel: toFaDigits(config.target),
    movesLabel: toFaDigits(movesLeft),
    comboLabel: combo > 1 ? `×${toFaDigits(combo)}` : null,
    bestLabel: level !== null && progress.best[level] ? toFaDigits(progress.best[level]) : null,
    progressValue: Math.min(100, (score / config.target) * 100),
    handleStart: start,
    handleRetry: () => level !== null && start(level),
    handleNext: () => level !== null && start(level + 1),
    handleLevels: () => setLevel(null),
    handleTap,
    handleSwap: (a: number, b: number) => void trySwap(a, b),
  }
}

export { useMatch3 }
