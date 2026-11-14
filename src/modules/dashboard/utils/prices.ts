import { z } from 'zod'

/** tgju keys for the free-market dollar and 18-karat gold per gram. */
const PRICE_KEYS = { dollar: 'price_dollar_rl', gold: 'geram18' } as const
type PriceId = keyof typeof PRICE_KEYS

type Price = {
  /** Toman. */
  price: number
  high: number
  low: number
  /** Change since the previous close, in percent; negative when it fell. */
  changePercent: number
  /** When tgju last updated it. */
  updatedAt: string
}

const rawPrice = z.object({
  p: z.string(),
  h: z.string(),
  l: z.string(),
  dp: z.union([z.number(), z.string()]),
  dt: z.string(),
  ts: z.string(),
})

/** tgju quotes rials as "2,669,000"; the app shows toman. */
const toToman = (rials: string) => Math.round(Number(rials.replace(/,/g, '')) / 10)

/** Pulls the two prices out of tgju's feed; a missing or malformed entry becomes null instead of throwing. */
const parsePrices = (json: unknown): Record<PriceId, Price | null> => {
  const current = (json as { current?: Record<string, unknown> } | null)?.current ?? {}
  const pick = (key: string): Price | null => {
    const r = rawPrice.safeParse(current[key])
    if (!r.success) return null
    const price = toToman(r.data.p)
    if (!Number.isFinite(price) || price <= 0) return null
    const percent = Math.abs(Number(r.data.dp)) || 0
    return {
      price,
      high: toToman(r.data.h),
      low: toToman(r.data.l),
      changePercent: r.data.dt === 'low' ? -percent : percent,
      updatedAt: r.data.ts,
    }
  }
  return { dollar: pick(PRICE_KEYS.dollar), gold: pick(PRICE_KEYS.gold) }
}

export { parsePrices }
export type { Price, PriceId }
