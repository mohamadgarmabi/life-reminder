import { createStore } from '@tanstack/react-store'
import { z } from 'zod'
import type { Settings } from '#/modules/settings/types'

const settingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  /** UI language; also sets the document direction (fa = rtl, en = ltr). */
  language: z.enum(['fa', 'en']),
  notificationsEnabled: z.boolean(),
  defaultReminderTime: z.string().regex(/^\d{2}:\d{2}$/),
  /** Animated page changes (View Transitions); read by the router on every navigation. */
  pageTransitions: z.boolean(),
  /** List or grid layout, remembered per page. */
  views: z.object({
    installments: z.enum(['list', 'grid']),
    reminders: z.enum(['list', 'grid']),
    plants: z.enum(['list', 'grid']),
  }),
  /** The one-time "swipe cards" tip was dismissed. */
  swipeHintSeen: z.boolean(),
  /** The first-launch welcome (sign in with Google or continue without) was answered. */
  welcomeSeen: z.boolean(),
  /** Random id the sync worker keys this install's Google sign-in by; null = not connected. */
  googleSession: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .nullable(),
  /** Home screen widgets in display order; mini = quarter row, small = half, large = full width. */
  widgets: z.array(
    z.object({
      id: z.enum(['dollar', 'gold', 'date', 'quick', 'overdue', 'today', 'upcoming', 'games', 'plants', 'plans']),
      size: z.enum(['mini', 'small', 'large']),
    }),
  ),
})

// UI preferences live in localStorage (not IndexedDB) because the theme must be readable
// synchronously before first paint. They are included in JSON export/import.
const SETTINGS_KEY = 'life-reminder:settings'

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  language: 'fa',
  notificationsEnabled: true,
  defaultReminderTime: '09:00',
  pageTransitions: true,
  swipeHintSeen: false,
  welcomeSeen: false,
  googleSession: null,
  views: { installments: 'list', reminders: 'list', plants: 'grid' },
  widgets: [
    { id: 'dollar', size: 'small' },
    { id: 'gold', size: 'small' },
    { id: 'date', size: 'small' },
    { id: 'overdue', size: 'small' },
    { id: 'quick', size: 'large' },
    { id: 'today', size: 'large' },
    { id: 'upcoming', size: 'large' },
    { id: 'games', size: 'large' },
    { id: 'plants', size: 'large' },
    { id: 'plans', size: 'small' },
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

export { settingsSchema, SETTINGS_KEY, DEFAULT_SETTINGS, settingsStore, initSettings, updateSettings }
