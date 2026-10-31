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

export { permissionStatus, requestPermission, showNotification }
