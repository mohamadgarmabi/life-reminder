import { TimeSelect } from '#/modules/shell/components/form-fields'
import { Badge } from '#/components/badge'
import { Button } from '#/components/button'
import { Label } from '#/components/label'
import { Switch } from '#/components/switch'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { useNotificationsCard } from '#/modules/settings/hooks/notifications-card.hook'

const NotificationsCard = () => {
  const {
    defaultReminderTime,
    permissionLabel,
    badgeVariant,
    isChecked,
    isDisabled,
    canSendTest,
    handleToggle,
    handleDefaultTimeChange,
    handleTestNotification,
  } = useNotificationsCard()

  return (
    <SettingsSection title="اعلان‌ها">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label htmlFor="notifications">نمایش اعلان یادآورها</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            وضعیت مجوز مرورگر: <Badge variant={badgeVariant}>{permissionLabel}</Badge>
          </p>
        </div>
        <Switch id="notifications" checked={isChecked} disabled={isDisabled} onCheckedChange={handleToggle} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="default-time">ساعت پیش‌فرض یادآوری</Label>
        <p className="text-xs text-muted-foreground">زمان اعلان اقساط و آبیاری، و ساعت پیشنهادی یادآورهای جدید.</p>
        <TimeSelect id="default-time" value={defaultReminderTime} onChange={handleDefaultTimeChange} />
      </div>
      {canSendTest && (
        <Button variant="outline" className="w-full" onClick={handleTestNotification}>
          ارسال اعلان آزمایشی
        </Button>
      )}
    </SettingsSection>
  )
}

export { NotificationsCard }
