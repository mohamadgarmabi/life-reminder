import { useQuery } from '@tanstack/react-query'
import { fetchPrices } from '#/modules/dashboard/apis/prices.api'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'

const REFRESH_MS = 5 * 60_000 // 5 minutes

const usePrices = () => {
  const { lang } = useI18n()
  const q = useQuery({
    queryKey: ['market-prices', lang],
    queryFn: ({ signal }) => fetchPrices(lang, signal),
    refetchInterval: REFRESH_MS,
    staleTime: REFRESH_MS,
  })
  return { prices: q.data ?? null, failed: q.isError }
}

export { usePrices }
