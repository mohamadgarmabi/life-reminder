// Imported into the generated Workbox service worker (see vite.config.ts → workbox.importScripts).
// App icon badge = notifications still in the tray.
const syncBadge = () =>
  'setAppBadge' in navigator && self.registration.getNotifications
    ? self.registration
        .getNotifications()
        .then((list) => (list.length ? navigator.setAppBadge(list.length) : navigator.clearAppBadge()))
        .catch(() => {})
    : Promise.resolve()

// Tells open app windows to re-read (same channel as src/modules/database/utils/live.ts).
const notifyApp = () => {
  try {
    const channel = new BroadcastChannel('life-reminder:db')
    channel.postMessage('change')
    channel.close()
  } catch {}
}

self.addEventListener('notificationclose', (event) => event.waitUntil(syncBadge().then(notifyApp)))

// Tapping a notification focuses an open app window, or opens one at the notification's page.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(syncBadge().then(notifyApp))
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
// Also records the notification in the in-app history (notificationHistory store, DB v3+).
const recordPush = (keys, entry) =>
  new Promise((resolve) => {
    const req = indexedDB.open('life-reminder')
    // The app's migrations own the schema; never create the database from here.
    req.onupgradeneeded = () => req.transaction.abort()
    req.onerror = () => resolve()
    req.onsuccess = () => {
      const db = req.result
      const stores = ['notificationLedger', 'notificationHistory'].filter((s) => db.objectStoreNames.contains(s))
      if (!stores.length) return resolve(db.close())
      const tx = db.transaction(stores, 'readwrite')
      const at = new Date().toISOString()
      if (stores.includes('notificationLedger'))
        for (const key of keys) tx.objectStore('notificationLedger').put({ key, firedAt: at })
      if (stores.includes('notificationHistory'))
        tx.objectStore('notificationHistory').put({ ...entry, id: crypto.randomUUID(), at })
      tx.oncomplete = tx.onerror = tx.onabort = () => resolve(db.close())
    }
  }).then(notifyApp)

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
      }).then(syncBadge),
      recordPush(Array.isArray(n.keys) ? n.keys : [], {
        title: n.title ?? 'یادآور زندگی',
        body: n.body ?? '',
        url: n.url ?? self.registration.scope,
      }).catch(() => {}),
    ]),
  )
})
