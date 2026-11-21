import { createFetch } from 'tanstack-fetch'
import { z } from 'zod'
import { AI_URL } from '#/modules/shell/apis/ai.api'
import { parseIsoDate } from '#/modules/shell/utils/dates'
import { t } from '#/modules/shell/utils/i18n'
import type { CalendarEvent } from '#/modules/reminders/types'

// The worker (push-worker/src/google.ts) reads the calendar with the user's Google sign-in (account module).
const responseSchema = z.object({
  connected: z.boolean(),
  events: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        // default: a worker deployed before descriptions were fetched
        description: z.string().default(''),
        start: z.string(),
        end: z.string(),
        allDay: z.boolean(),
      }),
    )
    .default([]),
})

// All-day events come as "YYYY-MM-DD" and must stay on that local day.
const toDate = (value: string, allDay: boolean) => (allDay ? parseIsoDate(value) : new Date(value))

/** connected=false: the sign-in hasn't finished yet, or access was removed in the Google account. */
const fetchGoogleEvents = async (session: string, from: Date, to: Date, signal: AbortSignal) => {
  if (!AI_URL) throw new Error(t('reminders.sync.notConfigured'))
  let raw: unknown
  try {
    raw = await createFetch({ baseUrl: AI_URL, timeoutMs: 30_000 }).post<unknown>('/google/events', {
      body: { session, timeMin: from.toISOString(), timeMax: to.toISOString() },
      signal,
    })
  } catch {
    throw new Error(t('reminders.sync.fetchFailed'))
  }
  const { connected, events } = responseSchema.parse(raw)
  return {
    connected,
    events: events.map((e): CalendarEvent => ({
      ...e,
      title: e.title || t('reminders.untitled'),
      start: toDate(e.start, e.allDay),
      end: toDate(e.end, e.allDay),
    })),
  }
}

export { fetchGoogleEvents }
