import type { PermissionStatus } from '#/modules/notifications/types'
import type { MessageKey } from '#/modules/shell/utils/i18n'

const PERMISSION_LABEL: Record<PermissionStatus, MessageKey> = {
  granted: 'settings.permission.granted',
  denied: 'settings.permission.denied',
  default: 'settings.permission.default',
  unsupported: 'settings.permission.unsupported',
}

export { PERMISSION_LABEL }
