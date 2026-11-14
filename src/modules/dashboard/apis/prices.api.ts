import { createFetch } from 'tanstack-fetch'
import { parsePrices } from '#/modules/dashboard/utils/prices'

// tgju's own site feed: keyless and CORS-open, but undocumented. shortcut: if it changes shape, parsePrices returns
// nulls and the tiles show "unavailable"; switch to a keyed API (e.g. brsapi.ir) if that starts happening.
const marketApi = createFetch({ baseUrl: 'https://call3.tgju.org', timeoutMs: 15_000 })

/** Dollar and gold prices; throws FetchError on HTTP/network failure. */
const fetchPrices = async ({ signal }: { signal: AbortSignal }) =>
  parsePrices(await marketApi.get<unknown>('/ajax.json', { signal }))

export { fetchPrices }
