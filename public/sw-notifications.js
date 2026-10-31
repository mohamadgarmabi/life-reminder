// Imported into the generated Workbox service worker (see vite.config.ts → workbox.importScripts).
// Tapping a notification focuses an open app window, or opens one at the notification's page.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url ?? self.registration.scope, self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((w) => w.url.startsWith(self.registration.scope))
      if (existing) return existing.focus().then((w) => w.navigate(url)).catch(() => {})
      return self.clients.openWindow(url)
    }),
  )
})
