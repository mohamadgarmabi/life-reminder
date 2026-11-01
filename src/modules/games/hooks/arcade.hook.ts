import { useEffect, useState } from 'react'
import type { GameOverlay, GameStatus } from '#/modules/games/types'
import { useScores } from '#/modules/games/hooks/scores.hook'
import { sfx } from '#/modules/games/utils/sfx'
import { toFaDigits } from '#/modules/shell/utils/format'

/** Status, score, leaderboard and start/game-over overlay shared by the real-time games. */
const useArcade = (key: string, intro: { title: string; detail: string }) => {
  const [status, setStatus] = useState<GameStatus>('ready')
  const [score, setScore] = useState(0)
  const [record, setRecord] = useState(false)
  const { scores, best, submit } = useScores(key)

  const begin = () => {
    setScore(0)
    setRecord(false)
    setStatus('playing')
  }

  /** Takes the final score explicitly: the score state may not have re-rendered yet. */
  const end = (final: number) => {
    const isRecord = final > 0 && submit(final)
    setScore(final)
    setRecord(isRecord)
    setStatus('over')
    if (isRecord) sfx.win()
    else sfx.lose()
  }

  const resume = () => setStatus('playing')

  // Like a native game: switching app, locking the phone or leaving the window pauses the run.
  useEffect(() => {
    const autoPause = () => setStatus((s) => (s === 'playing' ? 'paused' : s))
    const onVisibility = () => document.hidden && autoPause()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', autoPause)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', autoPause)
    }
  }, [])

  /** Start/game-over overlays fall back to the shell's onRestart (the view's start handler). */
  const overlay: GameOverlay | null =
    status === 'playing'
      ? null
      : status === 'paused'
        ? { title: 'مکث', action: 'ادامه', onAction: resume, restart: true }
        : status === 'ready'
          ? { ...intro, action: 'شروع' }
          : { title: record ? 'رکورد تازه!' : 'بازی تمام شد', detail: `امتیاز: ${toFaDigits(score)}`, action: 'دوباره' }

  const stats = [
    { label: 'امتیاز', value: toFaDigits(score) },
    { label: 'بهترین', value: best === null ? '—' : toFaDigits(best) },
  ]

  return {
    status,
    score,
    setScore,
    scores,
    stats,
    begin,
    end,
    overlay,
    pause: status === 'playing' ? () => setStatus('paused') : undefined,
  }
}

export { useArcade }
