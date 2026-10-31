import { z } from 'zod'

const PREFIX = 'life-reminder:games:'

/** Reads a saved game value; anything missing, unreadable or malformed yields null. */
const readGame = <T>(key: string, schema: z.ZodType<T>): T | null => {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const parsed = schema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

const writeGame = (key: string, value: unknown) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage full or blocked (private mode): the game keeps working, progress just isn't kept.
  }
}

const level = (max: number) => z.number().int().min(1).max(max)

export { readGame, writeGame, level }
