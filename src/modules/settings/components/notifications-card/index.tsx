import { Bell, BellRing, Clock } from 'lucide-react'
import { TimeSelect } from '#/modules/shell/components/form-fields'
import { Badge } from '#/components/badge'
import { Switch } from '#/components/switch'
import { SettingsRow } from '#/modules/settings/components/settings-row'
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
      <SettingsRow
        icon={Bell}
        tone="bg-red-500"
        title="نمایش اعلان یادآورها"
        htmlFor="notifications"
        description={
          <>
            مجوز مرورگر: <Badge variant={badgeVariant}>{permissionLabel}</Badge>
          </>
        }
        trailing={
          <Switch id="notifications" checked={isChecked} disabled={isDisabled} onCheckedChange={handleToggle} />
        }
      />
      <SettingsRow
        icon={Clock}
        tone="bg-orange-500"
        title="ساعت پیش‌فرض یادآوری"
        htmlFor="default-time"
        description="زمان اعلان اقساط و آبیاری، و ساعت پیشنهادی یادآورهای جدید."
      >
        <TimeSelect id="default-time" value={defaultReminderTime} onChange={handleDefaultTimeChange} />
      </SettingsRow>
      {canSendTest && (
        <SettingsRow icon={BellRing} tone="bg-amber-500" title="ارسال اعلان آزمایشی" onClick={handleTestNotification} />
      )}
    </SettingsSection>
  )
}

export { NotificationsCard }
