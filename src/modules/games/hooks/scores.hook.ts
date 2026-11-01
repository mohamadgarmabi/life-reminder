import { useEffect, useState } from 'react'
import { z } from 'zod'
import type { ScoreEntry } from '#/modules/games/types'
import { loadGameData, saveGameData } from '#/modules/games/utils/game-db'

const scoresSchema = z.array(z.object({ score: z.number(), at: z.number() }))

/** Local top-5 leaderboard for one game (or one game mode). */
const useScores = (key: string, lowerIsBetter = false) => {
  // Tagged with its key, so switching mode never shows the previous mode's board.
  const [state, setState] = useState<{ key: string; scores: ScoreEntry[] }>({ key, scores: [] })
  const scores = state.key === key ? state.scores : []

  useEffect(() => {
    let live = true
    void loadGameData(`scores:${key}`, scoresSchema).then((saved) => live && saved && setState({ key, scores: saved }))
    return () => {
      live = false
    }
  }, [key])

  /** Records a finished game; returns true when it beats the previous best. */
  const submit = (score: number) => {
    const isBest = scores.length === 0 || (lowerIsBetter ? score < scores[0].score : score > scores[0].score)
    const next = [...scores, { score, at: Date.now() }]
      .sort((a, b) => (lowerIsBetter ? a.score - b.score : b.score - a.score))
      .slice(0, 5)
    setState({ key, scores: next })
    void saveGameData(`scores:${key}`, next)
    return isBest
  }

  return { scores, best: scores[0]?.score ?? null, submit }
}

export { useScores }
