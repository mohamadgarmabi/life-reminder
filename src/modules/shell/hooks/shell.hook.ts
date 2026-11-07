import { useSelector } from '@tanstack/react-store'
import { useEffect } from 'react'
import { useSplashScreen } from 'vite-plugin-react-splash'
import { getDb } from '#/modules/database/apis/database.api'
import { startReminderEngine } from '#/modules/notifications/utils/reminder-engine'
import { initSettings, settingsStore } from '#/modules/settings/stores/settings.store'
import { appStore } from '#/modules/shell/stores/shell.store'

const useClientBootstrap = () => {
  const { hideSplashScreen } = useSplashScreen()
  useEffect(() => {
    initSettings()
    let stop: (() => void) | undefined
    getDb()
      .then(async () => {
        // Ask the browser not to evict our data under storage pressure.
        const persisted = navigator.storage?.persist ? await navigator.storage.persist().catch(() => false) : null
        appStore.setState((s) => ({ ...s, db: { state: 'ready', persisted } }))
        stop = startReminderEngine()
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : String(e)
        appStore.setState((s) => ({ ...s, db: { state: 'error', message } }))
      })
      .finally(hideSplashScreen) // splash is injected into the built shell only (see vite.config)
    return () => stop?.()
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
  return { isDbError: db.state === 'error', dbErrorMessage: db.state === 'error' ? db.message : '' }
}

const useStorageError = (message: string) => {
  return {
    description: `${message} اطلاعات قبلی شما حذف نشده است. در حالت مرور خصوصی یا با حافظهٔ پر، مرورگر ممکن است اجازهٔ ذخیره‌سازی ندهد.`,
    handleRetry: () => location.reload(),
  }
}

export { useClientBootstrap, useApplyTheme, useRootApp, useStorageError }
