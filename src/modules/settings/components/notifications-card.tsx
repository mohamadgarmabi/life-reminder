import { Info } from 'lucide-react'
import { TimeSelect } from '#/modules/shell/components/form-fields'
import { Alert, AlertDescription, AlertTitle } from '#/modules/shell/components/ui/alert'
import { Badge } from '#/modules/shell/components/ui/badge'
import { Button } from '#/modules/shell/components/ui/button'
import { Label } from '#/modules/shell/components/ui/label'
import { Switch } from '#/modules/shell/components/ui/switch'
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
      <Alert>
        <Info />
        <AlertTitle>محدودیت اعلان‌ها</AlertTitle>
        <AlertDescription>
          <ul className="list-disc space-y-1 ps-4">
            <li>این برنامه سرور ندارد؛ اعلان‌ها فقط وقتی برنامه (یا تب آن) باز است بررسی و نمایش داده می‌شوند.</li>
            <li>
              مرورگرها به صفحات وب اجازهٔ زمان‌بندی اعلان در زمانی مشخص را نمی‌دهند و سرویس‌ورکر نمی‌تواند تایمر دائمی
              داشته باشد. اعلان در زمان بسته بودن برنامه نیازمند Web Push و سرور ارسال‌کننده است.
            </li>
            <li>هر بار برنامه را باز کنید، یادآورهای جاافتاده بررسی و یک‌بار اعلان می‌شوند.</li>
            <li>
              در آیفون (iOS ۱۶٫۴ به بالا) اعلان فقط پس از «افزودن به صفحهٔ اصلی» و اجرای برنامه از همان آیکون کار
              می‌کند.
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </SettingsSection>
  )
}

export { NotificationsCard }
