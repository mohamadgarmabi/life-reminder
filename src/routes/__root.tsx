import { ClientOnly, HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { useSelector } from '@tanstack/react-store'
import { DatabaseZap } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useSplashScreen } from 'vite-plugin-react-splash'
import { AppShell } from '#/components/layout/app-shell'
import { EmptyState, ListSkeleton } from '#/components/shared/states'
import { Button } from '#/components/ui/button'
import { DirectionProvider } from '#/components/ui/direction'
import { Toaster } from '#/components/ui/sonner'
import { getDb } from '#/db/database'
import { startReminderEngine } from '#/features/notifications/reminder-engine'
import { UpdatePrompt } from '#/features/pwa/update-prompt'
import { appStore } from '#/stores/app.store'
import { initSettings, SETTINGS_KEY, settingsStore } from '#/stores/settings.store'
import appCss from '../styles.css?url'

const base = import.meta.env.BASE_URL

// Runs before first paint so a dark-theme user never sees a light flash.
const themeScript = `try{var t=(JSON.parse(localStorage.getItem('${SETTINGS_KEY}'))||{}).theme;if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: 'یادآور زندگی' },
      { name: 'description', content: 'مدیریت اقساط، آبیاری گل‌ها و یادآورهای شخصی — آفلاین و روی دستگاه خودتان.' },
      { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#f2f2f7' },
      { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#000000' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: `${base}manifest.webmanifest` },
      { rel: 'icon', href: `${base}favicon.svg`, type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: `${base}apple-touch-icon-180x180.png` },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  pendingComponent: () => <ListSkeleton />,
  notFoundComponent: () => (
    <EmptyState
      icon={DatabaseZap}
      title="صفحه پیدا نشد"
      description="آدرسی که باز کرده‌اید وجود ندارد."
      action={
        <Button asChild>
          <Link to="/">بازگشت به خانه</Link>
        </Button>
      }
    />
  ),
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        <DirectionProvider dir="rtl">{children}</DirectionProvider>
        <Scripts />
      </body>
    </html>
  )
}

// All content depends on on-device data and the current URL, so the prerendered shell is only a
// loading placeholder; rendering the app client-side avoids shell/route hydration mismatches.
function RootLayout() {
  return (
    <ClientOnly fallback={<div className="mx-auto max-w-lg p-4 pt-8"><ListSkeleton /></div>}>
      <App />
    </ClientOnly>
  )
}

function App() {
  useClientBootstrap()
  useApplyTheme()
  const db = useSelector(appStore, (s) => s.db)

  return (
    <AppShell>
      {db.state === 'error' ? <StorageError message={db.message} /> : <Outlet />}
      <Toaster />
      <UpdatePrompt />
    </AppShell>
  )
}

function useClientBootstrap() {
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

function useApplyTheme() {
  const theme = useSelector(settingsStore, (s) => s.theme)
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const apply = () =>
      document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && media.matches))
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
}

function StorageError({ message }: { message: string }) {
  return (
    <EmptyState
      icon={DatabaseZap}
      title="دسترسی به حافظهٔ دستگاه ممکن نیست"
      description={`${message} اطلاعات قبلی شما حذف نشده است. در حالت مرور خصوصی یا با حافظهٔ پر، مرورگر ممکن است اجازهٔ ذخیره‌سازی ندهد.`}
      action={<Button onClick={() => location.reload()}>تلاش دوباره</Button>}
    />
  )
}
