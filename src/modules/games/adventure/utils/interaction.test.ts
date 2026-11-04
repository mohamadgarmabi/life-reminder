import { describe, expect, it } from 'vitest'
import { pickTarget } from '#/modules/games/adventure/utils/interaction'

const at = (id: string, x: number, z: number, radius = 3) => ({ id, position: { x, y: 0, z }, radius })
const player = { x: 0, y: 0, z: 0 }
const north = { x: 0, z: -1 }

describe('pickTarget', () => {
  it('ignores targets out of reach', () => {
    expect(pickTarget([at('far', 0, -5)], player, north)).toBeNull()
  })

  it('ignores targets outside the view cone', () => {
    expect(pickTarget([at('side', 2.5, 0)], player, north)).toBeNull()
    expect(pickTarget([at('behind', 0, 2.5)], player, north)).toBeNull()
  })

  it('prefers the target nearest the view centre', () => {
    const picked = pickTarget([at('edge', 0.8, -2), at('centre', 0.1, -2.5)], player, north)
    expect(picked?.id).toBe('centre')
  })

  it('counts a target right underfoot whatever the direction', () => {
    expect(pickTarget([at('feet', 0.3, 0.3)], player, north)?.id).toBe('feet')
  })

  it('returns null with no targets', () => {
    expect(pickTarget([], player, north)).toBeNull()
  })
})
