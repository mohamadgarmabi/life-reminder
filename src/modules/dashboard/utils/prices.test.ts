import { describe, expect, it } from 'vitest'
import { parsePrices } from '#/modules/dashboard/utils/prices'

const entry = (p: string, dp: number, dt: string) => ({
  p,
  h: '2,679,000',
  l: '2,639,000',
  d: '0',
  dp,
  dt,
  ts: '2026-11-12 00:00:00',
})

describe('parsePrices', () => {
  it('reads dollar and gold in toman with signed change', () => {
    const prices = parsePrices({
      current: { price_dollar_rl: entry('2,669,000', 1.2, 'high'), geram18: entry('250,388,000', 0.5, 'low') },
    })
    expect(prices.dollar).toMatchObject({ price: 266_900, high: 267_900, low: 263_900, changePercent: 1.2 })
    expect(prices.gold?.price).toBe(25_038_800)
    expect(prices.gold?.changePercent).toBe(-0.5)
  })

  it('returns null for missing or broken entries instead of throwing', () => {
    expect(parsePrices(null)).toEqual({ dollar: null, gold: null })
    expect(parsePrices({ current: { price_dollar_rl: { p: 'n/a' }, geram18: entry('abc', 0, '') } })).toEqual({
      dollar: null,
      gold: null,
    })
  })
})
