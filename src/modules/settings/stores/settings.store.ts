import { createStore } from '@tanstack/react-store'
import { z } from 'zod'
import type { Settings } from '#/modules/settings/types'

const settingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  notificationsEnabled: z.boolean(),
  defaultReminderTime: z.string().regex(/^\d{2}:\d{2}$/),
})

// UI preferences live in localStorage (not IndexedDB) because the theme must be readable
// synchronously before first paint. They are included in JSON export/import.
const SETTINGS_KEY = 'life-reminder:settings'

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  notificationsEnabled: false,
  defaultReminderTime: '09:00',
}

const load = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...settingsSchema.partial().parse(JSON.parse(raw)) }
  } catch {
    // Unreadable preferences fall back to defaults; they hold no personal data.
  }
  return DEFAULT_SETTINGS
}

// Starts at defaults so the prerendered shell and first client render match; hydrated in initSettings().
const settingsStore = createStore<Settings>(DEFAULT_SETTINGS)

let initialised = false
const initSettings = () => {
  if (initialised) return
  initialised = true
  settingsStore.setState(() => load())
  settingsStore.subscribe((s) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
    } catch {
      // Storage full/blocked: the setting still applies for this session.
    }
  })
}

const updateSettings = (patch: Partial<Settings>) => settingsStore.setState((s) => ({ ...s, ...patch }))

export { settingsSchema, SETTINGS_KEY, DEFAULT_SETTINGS, settingsStore, initSettings, updateSettings }
