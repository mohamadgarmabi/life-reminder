import { Bell, BellOff } from 'lucide-react'
import { Button } from '#/components/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '#/components/drawer'
import { useNotificationCenter } from '#/modules/notifications/hooks/notification-center.hook'
import { ErrorState, ListSkeleton } from '#/modules/shell/components/states'
import { t } from '#/modules/shell/utils/i18n'

/** Bell with the tray count; opens the notification history with a button that clears the badge. */
const NotificationCenter = () => {
  const { open, setOpen, isLoading, error, isEmpty, items, hasUnread, unreadLabel, triggerLabel, handleClear } =
    useNotificationCenter()

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary" size="icon-sm" className="relative rounded-full" aria-label={triggerLabel}>
          <Bell />
          {hasUnread && (
            <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white">
              {unreadLabel}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between gap-3">
          <DrawerTitle>{triggerLabel}</DrawerTitle>
          <DrawerDescription className="sr-only">{t('notifications.center.description')}</DrawerDescription>
          <Button variant="secondary" size="sm" disabled={!hasUnread} onClick={handleClear}>
            <BellOff />
            {t('notifications.center.clear')}
          </Button>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {isLoading && <ListSkeleton rows={3} />}
          {error && <ErrorState error={error} />}
          {isEmpty && (
            <p className="py-10 text-center text-sm text-muted-foreground">{t('notifications.center.empty')}</p>
          )}
          <ul className="divide-y">
            {items.map((n) => (
              <li key={n.id} className="py-3">
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
              </li>
            ))}
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { NotificationCenter }
