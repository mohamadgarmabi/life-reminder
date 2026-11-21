import { createFetch } from 'tanstack-fetch'
import type { PermissionStatus, AppNotification } from '#/modules/notifications/types'
import { addHistory } from '#/modules/notifications/utils/notification-history'

const permissionStatus = (): PermissionStatus => {
  return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
}

const requestPermission = async (): Promise<PermissionStatus> => {
  if (permissionStatus() === 'unsupported') return 'unsupported'
  return Notification.requestPermission()
}

const showNotification = async (n: AppNotification) => {
  const icon = `${import.meta.env.BASE_URL}pwa-192x192.png`
  const options: NotificationOptions = {
    body: n.body,
    tag: n.tag,
    icon,
    badge: icon,
    lang: 'fa',
    dir: 'rtl',
    data: { url: `${import.meta.env.BASE_URL}${n.path.replace(/^\//, '')}` },
  }
  // History is a convenience; failing to record it must not block the notification.
  void addHistory({ title: n.title, body: n.body, url: options.data.url }).catch(() => {})
  // Android Chrome only allows notifications through a service worker registration.
  const registration = await navigator.serviceWorker?.getRegistration()
  if (registration) {
    await registration.showNotification(n.title, options)
    // The notification is already shown; a badge failure shouldn't fail the reminder check.
    return syncBadge().catch(() => {})
  }
  new Notification(n.title, options)
}

/** App icon badge = notifications still in the tray. No-op where the Badging API is missing. */
const syncBadge = async () => {
  const registration = await navigator.serviceWorker?.getRegistration()
  if (!registration?.getNotifications || !('setAppBadge' in navigator)) return
  const count = (await registration.getNotifications()).length
  await (count ? navigator.setAppBadge(count) : navigator.clearAppBadge())
}

/** Notifications still in the tray (what the badge counts). 0 where the tray can't be read. */
const trayCount = async () => {
  const registration = await navigator.serviceWorker?.getRegistration()
  return registration?.getNotifications ? (await registration.getNotifications()).length : 0
}

/** Removes every notification from the tray and the app icon badge. History is kept. */
const clearTray = async () => {
  const registration = await navigator.serviceWorker?.getRegistration()
  for (const n of (await registration?.getNotifications?.()) ?? []) n.close()
  if ('clearAppBadge' in navigator) await navigator.clearAppBadge()
}

const PUSH_URL = import.meta.env.VITE_PUSH_URL
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

/**
 * Uploads the upcoming notifications to the push relay (push-worker/), which delivers them while
 * the app is closed. `null` unregisters this device. No-op when the relay isn't configured.
 */
const syncPush = async (items: (AppNotification & { fireAt: Date; keys: string[] })[] | null) => {
  if (!PUSH_URL || !VAPID_PUBLIC_KEY || !(await navigator.serviceWorker?.getRegistration())) return
  const { pushManager } = await navigator.serviceWorker.ready
  if (!pushManager) return
  let subscription = await pushManager.getSubscription()
  if (!items && !subscription) return
  subscription ??= await pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: Uint8Array.from(atob(VAPID_PUBLIC_KEY.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
      c.charCodeAt(0),
    ),
  })
  // Throws FetchError on non-2xx.
  await createFetch({ baseUrl: PUSH_URL.replace(/\/$/, '') }).post('/sync', {
    body: {
      subscription: subscription.toJSON(),
      items: (items ?? []).map((n) => ({
        at: n.fireAt.getTime(),
        title: n.title,
        body: n.body,
        tag: n.tag,
        url: `${import.meta.env.BASE_URL}${n.path.replace(/^\//, '')}`,
        keys: n.keys,
      })),
    },
  })
}

export { permissionStatus, requestPermission, showNotification, syncBadge, syncPush, trayCount, clearTray }
