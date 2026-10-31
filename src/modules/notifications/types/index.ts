type PermissionStatus = NotificationPermission | 'unsupported'

interface AppNotification {
  title: string
  body: string
  tag: string
  /** Path inside the app (without base), opened when the notification is tapped. */
  path: string
}

interface Candidate extends AppNotification {
  fireAt: Date
  /** Every ledger key this notification covers; claiming any of them suppresses the rest too. */
  keys: string[]
}

export type { PermissionStatus, AppNotification, Candidate }
