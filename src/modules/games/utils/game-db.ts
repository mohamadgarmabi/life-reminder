import { openDB, type IDBPDatabase } from 'idb'
import type { z } from 'zod'

// Own database, so game saves never go through the app data's migrations.
let opening: Promise<IDBPDatabase> | null = null
const db = () => (opening ??= openDB('life-reminder-games', 1, { upgrade: (d) => d.createObjectStore('kv') }))

/** Reads a saved game value; missing, unreadable or malformed yields null. */
const loadGameData = async <T>(key: string, schema: z.ZodType<T>): Promise<T | null> => {
  try {
    const parsed = schema.safeParse(await (await db()).get('kv', key))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

const saveGameData = async (key: string, value: unknown) => {
  try {
    await (await db()).put('kv', value, key)
  } catch {
    // Storage blocked (private mode): the game keeps working, progress just isn't kept.
  }
}

export { loadGameData, saveGameData }
