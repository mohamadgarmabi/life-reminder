const listeners = new Set<() => void>()
// Keeps other open tabs/windows of the app in sync.
// Browser only: an open channel in Node (shell prerender) would keep the build process alive.
const channel =
  typeof window === 'undefined' || typeof BroadcastChannel === 'undefined'
    ? null
    : new BroadcastChannel('life-reminder:db')
channel?.addEventListener('message', () => listeners.forEach((l) => l()))

/** Call after every committed write so live queries re-read. */
const notifyDbChange = () => {
  listeners.forEach((l) => l())
  channel?.postMessage('change')
}

const subscribeDbChange = (listener: () => void) => {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export { notifyDbChange, subscribeDbChange }
