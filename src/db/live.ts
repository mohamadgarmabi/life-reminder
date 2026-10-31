import { useEffect, useState } from 'react'

const listeners = new Set<() => void>()
// Keeps other open tabs/windows of the app in sync.
// Browser only: an open channel in Node (shell prerender) would keep the build process alive.
const channel =
  typeof window === 'undefined' || typeof BroadcastChannel === 'undefined'
    ? null
    : new BroadcastChannel('life-reminder:db')
channel?.addEventListener('message', () => listeners.forEach((l) => l()))

/** Call after every committed write so live queries re-read. */
export function notifyDbChange() {
  listeners.forEach((l) => l())
  channel?.postMessage('change')
}

export function subscribeDbChange(listener: () => void) {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export type LiveQuery<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: Error }

/** Runs `query` on mount, when `deps` change, and after any database write. */
export function useLiveQuery<T>(query: () => Promise<T>, deps: readonly unknown[] = []): LiveQuery<T> {
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
  }, [version, ...deps])

  return state
}
