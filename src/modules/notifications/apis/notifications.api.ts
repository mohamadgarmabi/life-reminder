import { createFetch } from 'tanstack-fetch'
import type { PermissionStatus, AppNotification } from '#/modules/notifications/types'

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
  // Android Chrome only allows notifications through a service worker registration.
  const registration = await navigator.serviceWorker?.getRegistration()
  if (registration) return registration.showNotification(n.title, options)
  new Notification(n.title, options)
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

export { permissionStatus, requestPermission, showNotification, syncPush }
