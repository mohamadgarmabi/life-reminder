import { Bell, BellRing, Clock } from 'lucide-react'
import { TimeSelect } from '#/modules/shell/components/form-fields'
import { Badge } from '#/components/badge'
import { Switch } from '#/components/switch'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { useNotificationsCard } from '#/modules/settings/hooks/notifications-card.hook'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'

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
  const { t } = useI18n()

  return (
    <SettingsSection title={t('settings.notifications.title')}>
      <SettingsRow
        icon={Bell}
        tone="bg-red-500"
        title={t('settings.notifications.show')}
        htmlFor="notifications"
        description={
          <>
            {t('settings.notifications.permission')} <Badge variant={badgeVariant}>{permissionLabel}</Badge>
          </>
        }
        trailing={
          <Switch id="notifications" checked={isChecked} disabled={isDisabled} onCheckedChange={handleToggle} />
        }
      />
      <SettingsRow
        icon={Clock}
        tone="bg-orange-500"
        title={t('settings.notifications.defaultTime')}
        htmlFor="default-time"
        description={t('settings.notifications.defaultTimeHint')}
      >
        <TimeSelect id="default-time" value={defaultReminderTime} onChange={handleDefaultTimeChange} />
      </SettingsRow>
      {canSendTest && (
        <SettingsRow
          icon={BellRing}
          tone="bg-amber-500"
          title={t('settings.notifications.sendTest')}
          onClick={handleTestNotification}
        />
      )}
    </SettingsSection>
  )
}

export { NotificationsCard }
