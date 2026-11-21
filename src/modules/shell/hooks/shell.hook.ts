import { useSelector } from '@tanstack/react-store'
import { useEffect } from 'react'
import { useSplashScreen } from 'vite-plugin-react-splash'
import { isGoogleSignInAvailable } from '#/modules/account/apis/google-account.api'
import { getDb } from '#/modules/database/apis/database.api'
import { startSyncEngine } from '#/modules/account/utils/sync-engine'
import { startReminderEngine } from '#/modules/notifications/utils/reminder-engine'
import { initSettings, settingsStore } from '#/modules/settings/stores/settings.store'
import { appStore } from '#/modules/shell/stores/shell.store'
import { t } from '#/modules/shell/utils/i18n'

const useClientBootstrap = () => {
  const { hideSplashScreen } = useSplashScreen()
  useEffect(() => {
    initSettings()
    let stop: (() => void) | undefined
    let stopSync: (() => void) | undefined
    getDb()
      .then(async () => {
        // Ask the browser not to evict our data under storage pressure.
        const persisted = navigator.storage?.persist ? await navigator.storage.persist().catch(() => false) : null
        appStore.setState((s) => ({ ...s, db: { state: 'ready', persisted } }))
        stop = startReminderEngine()
        stopSync = startSyncEngine()
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : String(e)
        appStore.setState((s) => ({ ...s, db: { state: 'error', message } }))
      })
      .finally(hideSplashScreen) // splash is injected into the built shell only (see vite.config)
    return () => {
      stop?.()
      stopSync?.()
    }
  }, [hideSplashScreen])
}

const useApplyTheme = () => {
  const theme = useSelector(settingsStore, (s) => s.theme)
  const { setSplashTheme } = useSplashScreen()
  useEffect(() => {
    // The splash runs before the app; it reads this saved choice on the next launch.
    setSplashTheme(theme === 'system' ? 'auto' : theme)
    const media = matchMedia('(prefers-color-scheme: dark)')
    const apply = () =>
      document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && media.matches))
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme, setSplashTheme])
}

const useRootApp = () => {
  useClientBootstrap()
  useApplyTheme()
  const db = useSelector(appStore, (s) => s.db)
  // Signed in = a session Google confirmed (welcomeSeen is set when the sign-in finishes).
  const signedIn = useSelector(settingsStore, (s) => s.welcomeSeen && !!s.googleSession)
  return {
    isDbError: db.state === 'error',
    dbErrorMessage: db.state === 'error' ? db.message : '',
    // Settings are loaded by the time the database is ready, so returning users never see a flash of it.
    // With sign-in configured the app needs an account; with it off, the app stays local-only.
    showWelcome: isGoogleSignInAvailable && db.state === 'ready' && !signedIn,
  }
}

const useStorageError = (message: string) => {
  return {
    description: t('shell.storage.description', { message }),
    handleRetry: () => location.reload(),
  }
}

export { useClientBootstrap, useApplyTheme, useRootApp, useStorageError }
