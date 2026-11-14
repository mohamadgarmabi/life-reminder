import { useQuery } from '@tanstack/react-query'
import { fetchPrices } from '#/modules/dashboard/apis/prices.api'

const REFRESH_MS = 5 * 60_000 // 5 minutes

const usePrices = () => {
  const q = useQuery({
    queryKey: ['market-prices'],
    queryFn: fetchPrices,
    refetchInterval: REFRESH_MS,
    staleTime: REFRESH_MS,
  })
  return { prices: q.data ?? null, failed: q.isError }
}

export { usePrices }
