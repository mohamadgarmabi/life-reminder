import type { PermissionStatus } from '#/modules/notifications/types'

const PERMISSION_LABEL: Record<PermissionStatus, string> = {
  granted: 'مجاز',
  denied: 'مسدود',
  default: 'درخواست نشده',
  unsupported: 'پشتیبانی نمی‌شود',
}

export { PERMISSION_LABEL }
