import { useSelector } from '@tanstack/react-store'
import { useState } from 'react'
import { toast } from '#/components/sonner'
import { permissionStatus, requestPermission, showNotification } from '#/modules/notifications/apis/notifications.api'
import type { PermissionStatus } from '#/modules/notifications/types'
import { runReminderCheck } from '#/modules/notifications/utils/reminder-engine'
import { settingsStore, updateSettings } from '#/modules/settings/stores/settings.store'
import { PERMISSION_LABEL } from '#/modules/settings/utils/settings.constants'
import { t } from '#/modules/shell/utils/i18n'

const useNotificationsCard = () => {
  const { notificationsEnabled, defaultReminderTime } = useSelector(settingsStore, (s) => s)
  // The app renders client-only, so the browser permission can be read during the first render.
  const [permission, setPermission] = useState<PermissionStatus>(() => permissionStatus())

  const handleToggle = async (enabled: boolean) => {
    if (!enabled) return updateSettings({ notificationsEnabled: false })
    const result = permission === 'granted' ? permission : await requestPermission()
    setPermission(result)
    if (result !== 'granted') {
      toast.error(t(result === 'denied' ? 'settings.notifications.blocked' : 'settings.notifications.notGranted'))
      return
    }
    updateSettings({ notificationsEnabled: true })
    void runReminderCheck()
  }

  const handleDefaultTimeChange = (v: string) => updateSettings({ defaultReminderTime: v })

  const handleTestNotification = () =>
    void showNotification({
      title: t('settings.notifications.testTitle'),
      body: t('settings.notifications.testBody'),
      tag: 'test',
      path: '/settings',
    })

  const isActive = notificationsEnabled && permission === 'granted'

  return {
    defaultReminderTime,
    permissionLabel: t(PERMISSION_LABEL[permission]),
    badgeVariant: permission === 'granted' ? ('default' as const) : ('secondary' as const),
    isChecked: isActive,
    isDisabled: permission === 'unsupported',
    canSendTest: isActive,
    handleToggle,
    handleDefaultTimeChange,
    handleTestNotification,
  }
}

export { useNotificationsCard }
