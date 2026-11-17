import { useEffect, useState } from 'react'
import type { GameOverlay, GameStatus } from '#/modules/games/types'
import { useScores } from '#/modules/games/hooks/scores.hook'
import { sfx } from '#/modules/games/utils/sfx'
import { toLocalDigits } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'

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
        ? { title: t('games.paused'), action: t('games.resume'), onAction: resume, restart: true }
        : status === 'ready'
          ? { ...intro, action: t('games.start') }
          : {
              title: t(record ? 'games.newRecord' : 'games.gameOver'),
              detail: t('games.scoreDetail', { score: toLocalDigits(score) }),
              action: t('games.playAgain'),
            }

  const stats = [
    { label: t('games.score'), value: toLocalDigits(score) },
    { label: t('games.best'), value: best === null ? '—' : toLocalDigits(best) },
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
