import { createFetch } from 'tanstack-fetch'
import { z } from 'zod'
import { AI_URL } from '#/modules/shell/apis/ai.api'
import { getLanguage, t } from '#/modules/shell/utils/i18n'

// The push/AI worker (push-worker/src/google.ts) holds the Google sign-in; the app keeps only a random session id.
// Off unless VITE_GOOGLE_SIGN_IN=true: hides the welcome screen, account card and calendar sync, and sends nothing.
const isGoogleSignInAvailable = import.meta.env.VITE_GOOGLE_SIGN_IN === 'true' && !!AI_URL

const newGoogleSession = () =>
  [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, '0')).join('')

/** Google's account picker; the page closes itself after signing in. */
const googleSignInUrl = (session: string) => `${AI_URL}/google/auth?session=${session}&lang=${getLanguage()}`

const googleAccountSchema = z.object({ name: z.string(), email: z.string(), picture: z.string() })

const accountResponseSchema = z.object({ connected: z.boolean(), account: googleAccountSchema.optional() })

/** connected=false: the sign-in hasn't finished yet, or access was removed in the Google account. */
const fetchGoogleAccount = async (session: string, signal: AbortSignal) => {
  if (!AI_URL) throw new Error(t('account.notConfigured'))
  let raw: unknown
  try {
    raw = await createFetch({ baseUrl: AI_URL }).post<unknown>('/google/account', { body: { session }, signal })
  } catch {
    throw new Error(t('account.network'))
  }
  return accountResponseSchema.parse(raw)
}

/** Best effort: the app forgets the session either way. */
const signOutGoogle = async (session: string) => {
  if (!AI_URL) return
  await createFetch({ baseUrl: AI_URL })
    .post('/google/disconnect', { body: { session } })
    .catch(() => undefined)
}

export {
  isGoogleSignInAvailable,
  newGoogleSession,
  googleSignInUrl,
  googleAccountSchema,
  fetchGoogleAccount,
  signOutGoogle,
}
