import { createFetch } from 'tanstack-fetch'
import { parsePrices } from '#/modules/dashboard/utils/prices'
import type { Language } from '#/modules/shell/utils/i18n'

// tgju's own site feed: keyless and CORS-open, but undocumented. shortcut: if it changes shape, parsePrices returns
// nulls and the tiles show "unavailable"; switch to a keyed API (e.g. brsapi.ir) if that starts happening.
const marketApi = createFetch({ baseUrl: 'https://call3.tgju.org', timeoutMs: 15_000 })

/** Dollar and gold prices (Tehran market in Persian, world in English); throws FetchError on HTTP/network failure. */
const fetchPrices = async (lang: Language, signal: AbortSignal) =>
  parsePrices(await marketApi.get<unknown>('/ajax.json', { signal }), lang)

export { fetchPrices }
