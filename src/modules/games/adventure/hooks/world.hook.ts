import { useEngine, useGame, updateSession } from '#/modules/games/adventure/stores/session.store'
import { dispatchPuzzle, isPuzzleSolved } from '#/modules/games/adventure/utils/session'
import { playSfx } from '#/modules/games/adventure/utils/audio'

/** [state, dispatch, solved]; dispatch runs the world's pure rule, grants rewards and plays the solve sound. */
const usePuzzle = <S, A>(puzzleId: string) => {
  const { world, store } = useEngine()
  const state = useGame((g) => g.session.puzzles[puzzleId]) as S
  const solved = useGame((g) => isPuzzleSolved(g.session, world, puzzleId))
  const dispatch = (action: A) => {
    const before = store.state.session
    updateSession(store, (s) => dispatchPuzzle(s, world, puzzleId, action))
    const after = store.state.session
    if (!isPuzzleSolved(before, world, puzzleId) && isPuzzleSolved(after, world, puzzleId)) {
      playSfx('right')
      playSfx('open')
    }
    return after.puzzles[puzzleId] as S
  }
  return [state, dispatch, solved] as const
}

const useHasItem = (itemId: string) => useGame((g) => g.session.inventory.includes(itemId))

const useSecretFound = (secretId: string) => useGame((g) => g.session.secrets.includes(secretId))

/** Quality tier in use ('auto' already resolved). */
const useTier = () => useGame((g) => g.tier)

/** True from the ending onwards (and on any later visit after finishing). */
const useCompleted = () => useGame((g) => g.phase === 'ending' || g.session.completed)

export { usePuzzle, useHasItem, useSecretFound, useTier, useCompleted }
