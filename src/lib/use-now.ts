import { useEffect, useState } from 'react'

/** Current time, refreshed every minute so "today"/"overdue" labels roll over at midnight. */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
