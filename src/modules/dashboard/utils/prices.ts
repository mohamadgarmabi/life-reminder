import { z } from 'zod'
import { formatNumber } from '#/modules/shell/utils/format'
import { getLanguage, t, type Language } from '#/modules/shell/utils/i18n'

/**
 * tgju keys. Persian: Tehran free-market dollar and 18-karat gold per gram (rials).
 * English: world prices in USD; the feed has no dollar index, so "dollar" is the EUR/USD rate.
 */
const PRICE_KEYS = {
  fa: { dollar: 'price_dollar_rl', gold: 'geram18' },
  en: { dollar: 'eur-usd-ask', gold: 'ons' },
} as const
type PriceId = keyof (typeof PRICE_KEYS)['fa']

type Price = {
  /** Toman in Persian, US dollars in English. */
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
const toUsd = (usd: string) => Number(usd.replace(/,/g, ''))

/** Pulls the two prices out of tgju's feed; a missing or malformed entry becomes null instead of throwing. */
const parsePrices = (json: unknown, lang: Language = 'fa'): Record<PriceId, Price | null> => {
  const convert = lang === 'fa' ? toToman : toUsd
  const current = (json as { current?: Record<string, unknown> } | null)?.current ?? {}
  const pick = (key: string): Price | null => {
    const r = rawPrice.safeParse(current[key])
    if (!r.success) return null
    const price = convert(r.data.p)
    if (!Number.isFinite(price) || price <= 0) return null
    const percent = Math.abs(Number(r.data.dp)) || 0
    return {
      price,
      high: convert(r.data.h),
      low: convert(r.data.l),
      changePercent: r.data.dt === 'low' ? -percent : percent,
      updatedAt: r.data.ts,
    }
  }
  return { dollar: pick(PRICE_KEYS[lang].dollar), gold: pick(PRICE_KEYS[lang].gold) }
}

const PRICE_LABELS = {
  dollar: {
    title: 'dashboard.price.dollarTitle',
    short: 'dashboard.price.dollarShort',
    unit: 'dashboard.price.dollarUnit',
  },
  gold: { title: 'dashboard.price.goldTitle', short: 'dashboard.price.goldShort', unit: 'dashboard.price.goldUnit' },
} as const

/** World prices: EUR/USD needs 4 decimals, the gold ounce 2. */
const formatUsd = (n: number, digits = n < 10 ? 4 : 2) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`

const formatPrice = (n: number) => (getLanguage() === 'fa' ? formatNumber(n) : formatUsd(n))

/** "۲۶۶ هزار" / "۲۵٫۰ میلیون" / "$3,858": fits a 1×1 tile. */
const compactPrice = (n: number) => {
  if (getLanguage() === 'en') return formatUsd(n, n < 10 ? 4 : 0)
  return n >= 1_000_000
    ? t('dashboard.price.million', { n: formatNumber(Math.round(n / 100_000) / 10) })
    : t('dashboard.price.thousand', { n: formatNumber(Math.round(n / 1000)) })
}

export { compactPrice, formatPrice, parsePrices, PRICE_LABELS }
export type { Price, PriceId }
