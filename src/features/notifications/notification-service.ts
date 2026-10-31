export type PermissionStatus = NotificationPermission | 'unsupported'

export function permissionStatus(): PermissionStatus {
  return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
}

/** Must be called from a user gesture (button click). */
export async function requestPermission(): Promise<PermissionStatus> {
  if (permissionStatus() === 'unsupported') return 'unsupported'
  return Notification.requestPermission()
}

export interface AppNotification {
  title: string
  body: string
  tag: string
  /** Path inside the app (without base), opened when the notification is tapped. */
  path: string
}

export async function showNotification(n: AppNotification) {
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
