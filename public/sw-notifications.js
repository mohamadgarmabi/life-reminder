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

// Web Push from push-worker/: shows the notification while the app is closed.
// Its ledger keys are recorded so the app doesn't show the same item again when opened.
const claimLedger = (keys) =>
  new Promise((resolve) => {
    const req = indexedDB.open('life-reminder')
    // The app's migrations own the schema; never create the database from here.
    req.onupgradeneeded = () => req.transaction.abort()
    req.onerror = () => resolve()
    req.onsuccess = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('notificationLedger')) return resolve(db.close())
      const tx = db.transaction('notificationLedger', 'readwrite')
      const firedAt = new Date().toISOString()
      for (const key of keys) tx.objectStore('notificationLedger').put({ key, firedAt })
      tx.oncomplete = tx.onerror = tx.onabort = () => resolve(db.close())
    }
  })

self.addEventListener('push', (event) => {
  const n = event.data?.json() ?? {}
  const icon = new URL('pwa-192x192.png', self.registration.scope).href
  event.waitUntil(
    Promise.all([
      // iOS revokes the subscription if a push doesn't show a notification, so always show one.
      self.registration.showNotification(n.title ?? 'یادآور زندگی', {
        body: n.body,
        tag: n.tag,
        icon,
        badge: icon,
        lang: 'fa',
        dir: 'rtl',
        data: { url: n.url },
      }),
      claimLedger(Array.isArray(n.keys) ? n.keys : []).catch(() => {}),
    ]),
  )
})
