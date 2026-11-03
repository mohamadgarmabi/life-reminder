import { createStore } from '@tanstack/react-store'
import { z } from 'zod'
import type { Settings } from '#/modules/settings/types'

const settingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  notificationsEnabled: z.boolean(),
  defaultReminderTime: z.string().regex(/^\d{2}:\d{2}$/),
  /** Off: every surface is a plain solid colour and the glass renderer stays idle. */
  glassEnabled: z.boolean(),
  /** Liquid glass on every surface (simple-liquid-glass). Unset numbers inherit the material preset. */
  glass: z.object({
    material: z.enum(['clear', 'frosted', 'smoked', 'subtle']),
    blur: z.number().optional(),
    saturation: z.number().optional(),
    scale: z.number().optional(),
    aberrationIntensity: z.number().optional(),
    frost: z.number().optional(),
    /** Opacity of the theme-coloured tint (white in light theme, #2C2C2E in dark). */
    tint: z.number(),
    /** Opacity of the light rim around each surface. */
    rim: z.number(),
  }),
  /** List or grid layout, remembered per page. */
  views: z.object({
    installments: z.enum(['list', 'grid']),
    reminders: z.enum(['list', 'grid']),
    plants: z.enum(['list', 'grid']),
  }),
  /** Home screen widgets in display order; mini = quarter row, small = half, large = full width. */
  widgets: z.array(
    z.object({
      id: z.enum(['date', 'quick', 'overdue', 'today', 'upcoming', 'games']),
      size: z.enum(['mini', 'small', 'large']),
    }),
  ),
})

// UI preferences live in localStorage (not IndexedDB) because the theme must be readable
// synchronously before first paint. They are included in JSON export/import.
const SETTINGS_KEY = 'life-reminder:settings'

const DEFAULT_GLASS: Settings['glass'] = { material: 'frosted', tint: 0.55, rim: 0.75 }

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  notificationsEnabled: true,
  defaultReminderTime: '09:00',
  glassEnabled: false,
  glass: DEFAULT_GLASS,
  views: { installments: 'list', reminders: 'list', plants: 'grid' },
  widgets: [
    { id: 'date', size: 'small' },
    { id: 'overdue', size: 'small' },
    { id: 'quick', size: 'large' },
    { id: 'today', size: 'large' },
    { id: 'upcoming', size: 'large' },
    { id: 'games', size: 'large' },
  ],
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

export { settingsSchema, SETTINGS_KEY, DEFAULT_SETTINGS, DEFAULT_GLASS, settingsStore, initSettings, updateSettings }
