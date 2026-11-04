import { describe, expect, it } from 'vitest'
import { nextTier, type TierState } from '#/modules/games/adventure/utils/quality'

const run = (start: TierState, samples: number[], mode: 'auto' | 'low' | 'high' = 'auto') =>
  samples.reduce((s, fps) => nextTier(s, fps, mode), start)

const high: TierState = { tier: 'high', slowFor: 0, fastFor: 0 }

describe('nextTier', () => {
  it('drops to low after 3 seconds below 30 FPS', () => {
    expect(run(high, [25, 25]).tier).toBe('high')
    expect(run(high, [25, 25, 25]).tier).toBe('low')
  })

  it('needs the slow seconds to be consecutive', () => {
    expect(run(high, [25, 25, 40, 25, 25]).tier).toBe('high')
  })

  it('recovers only after 10 seconds above 55 FPS', () => {
    const low = run(high, [20, 20, 20])
    expect(run(low, Array(9).fill(60)).tier).toBe('low')
    expect(run(low, Array(10).fill(60)).tier).toBe('high')
  })

  it('never changes a manual quality', () => {
    expect(run(high, Array(20).fill(10), 'high').tier).toBe('high')
    expect(run(high, Array(20).fill(60), 'low').tier).toBe('low')
  })
})
