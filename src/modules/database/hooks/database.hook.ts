import { useEffect, useState } from 'react'
import type { LiveQuery } from '#/modules/database/types'
import { subscribeDbChange } from '#/modules/database/utils/live'

/** Runs `query` on mount, when `deps` change, and after any database write. */
const useLiveQuery = <T>(query: () => Promise<T>, deps: readonly unknown[] = []): LiveQuery<T> => {
  const [state, setState] = useState<LiveQuery<T>>({ status: 'loading', data: undefined, error: undefined })
  const [version, setVersion] = useState(0)

  useEffect(() => subscribeDbChange(() => setVersion((v) => v + 1)), [])

  useEffect(() => {
    let cancelled = false
    query().then(
      (data) => !cancelled && setState({ status: 'success', data, error: undefined }),
      (e: unknown) =>
        !cancelled &&
        setState({ status: 'error', data: undefined, error: e instanceof Error ? e : new Error(String(e)) }),
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass `deps` explicitly; `query` is a fresh closure every render
  }, [version, ...deps])

  return state
}

export { useLiveQuery }
