import type { Quality } from '#/modules/games/adventure/types'

type Tier = 'low' | 'high'
type TierState = { tier: Tier; slowFor: number; fastFor: number }

const MIN_FPS = 30
const RECOVER_FPS = 55
const DROP_AFTER = 3 // seconds below MIN_FPS
const RECOVER_AFTER = 10 // seconds above RECOVER_FPS

/** One step per one-second FPS sample; a manual quality is never changed. */
const nextTier = (state: TierState, fps: number, mode: Quality): TierState => {
  if (mode !== 'auto') return { tier: mode, slowFor: 0, fastFor: 0 }
  const slowFor = fps < MIN_FPS ? state.slowFor + 1 : 0
  const fastFor = fps > RECOVER_FPS ? state.fastFor + 1 : 0
  if (state.tier === 'high' && slowFor >= DROP_AFTER) return { tier: 'low', slowFor: 0, fastFor: 0 }
  if (state.tier === 'low' && fastFor >= RECOVER_AFTER) return { tier: 'high', slowFor: 0, fastFor: 0 }
  return { tier: state.tier, slowFor, fastFor }
}

export { nextTier }
export type { Tier, TierState }
