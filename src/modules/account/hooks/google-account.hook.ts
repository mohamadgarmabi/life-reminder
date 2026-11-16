import { useQuery } from '@tanstack/react-query'
import { useSelector } from '@tanstack/react-store'
import { toast } from '#/components/sonner'
import {
  fetchGoogleAccount,
  googleSignInUrl,
  isGoogleSignInAvailable,
  newGoogleSession,
  signOutGoogle,
} from '#/modules/account/apis/google-account.api'
import { settingsStore, updateSettings } from '#/modules/settings/stores/settings.store'

/** While the sign-in tab is open, check often so the app reacts as soon as it finishes. */
const SIGN_IN_POLL_MS = 3000

/** Google sign-in state shared by the welcome screen, settings and the reminders calendar. */
const useGoogleAccount = () => {
  const stored = useSelector(settingsStore, (s) => s.googleSession)
  // With the feature off, a session left from earlier is ignored, so nothing Google-related runs or shows.
  const session = isGoogleSignInAvailable ? stored : null
  const q = useQuery({
    queryKey: ['google-account', session],
    queryFn: ({ signal }) => fetchGoogleAccount(session ?? '', signal),
    enabled: !!session && isGoogleSignInAvailable,
    staleTime: 10 * 60_000,
    refetchInterval: (query) => (query.state.data?.connected === false ? SIGN_IN_POLL_MS : false),
    // Coming back from the sign-in tab checks at once.
    refetchOnWindowFocus: true,
  })

  const signIn = () => {
    const next = newGoogleSession()
    updateSettings({ googleSession: next })
    // Opened straight from the tap, so it isn't blocked as a popup.
    window.open(googleSignInUrl(next), '_blank')
  }

  const signOut = () => {
    if (session) void signOutGoogle(session)
    updateSettings({ googleSession: null })
    toast.success('از حساب گوگل خارج شدید.')
  }

  return {
    isAvailable: isGoogleSignInAvailable,
    session,
    account: q.data?.connected ? q.data.account : undefined,
    isSignedIn: q.data?.connected === true,
    /** A session exists but Google hasn't confirmed it (sign-in tab still open, or abandoned). */
    isWaiting: !!session && q.data?.connected === false,
    error: q.error,
    signIn,
    signOut,
    /** Abandons a sign-in that was started but never finished. */
    cancelSignIn: () => updateSettings({ googleSession: null }),
  }
}

export { useGoogleAccount }
