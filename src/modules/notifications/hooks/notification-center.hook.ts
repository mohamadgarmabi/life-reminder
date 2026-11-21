import { useState } from 'react'
import { toast } from '#/components/sonner'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { notifyDbChange } from '#/modules/database/utils/live'
import { clearTray, trayCount } from '#/modules/notifications/apis/notifications.api'
import { listHistory } from '#/modules/notifications/utils/notification-history'
import { formatDateTime, toLocalDigits } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'

const useNotificationCenter = () => {
  const [open, setOpen] = useState(false)
  // Re-read on open too: tray dismissals on iOS don't always reach the service worker.
  const q = useLiveQuery(async () => {
    const [items, unread] = await Promise.all([listHistory(), trayCount().catch(() => 0)])
    return { items, unread }
  }, [open])
  const unread = q.data?.unread ?? 0

  const handleClear = async () => {
    try {
      await clearTray()
    } catch {
      toast.error(t('notifications.center.clearFailed'))
    }
    notifyDbChange()
  }

  return {
    open,
    setOpen,
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: q.status === 'success' && !q.data.items.length,
    items: (q.data?.items ?? []).map((n) => ({ ...n, time: formatDateTime(new Date(n.at)) })),
    hasUnread: unread > 0,
    unreadLabel: toLocalDigits(unread > 99 ? '99+' : unread),
    triggerLabel: t('notifications.center.title'),
    handleClear: () => void handleClear(),
  }
}

export { useNotificationCenter }
