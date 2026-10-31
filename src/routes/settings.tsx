import { createFileRoute } from '@tanstack/react-router'
import { useSelector } from '@tanstack/react-store'
import { Download, Info, Moon, Sun, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { toast } from 'sonner'
import { TimeSelect } from '#/components/form/form'
import { ConfirmDialog } from '#/components/shared/dialogs'
import { PageHeader } from '#/components/shared/states'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { downloadText, exportData, importData, parseBackup, type Backup } from '#/features/backup/backup'
import { permissionStatus, requestPermission, showNotification, type PermissionStatus } from '#/features/notifications/notification-service'
import { runReminderCheck } from '#/features/notifications/reminder-engine'
import { todayIso } from '#/lib/dates'
import { formatNumber, toFaDigits } from '#/lib/format'
import { cn } from '#/lib/utils'
import { appStore } from '#/stores/app.store'
import { settingsStore, updateSettings } from '#/stores/settings.store'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

function SettingsPage() {
  return (
    <>
      <PageHeader title="تنظیمات" />
      <div className="space-y-4">
        <NotificationsCard />
        <ThemeCard />
        <DataCard />
        <StorageCard />
        <p className="pt-2 text-center text-xs text-muted-foreground">
          یادآور زندگی · نسخهٔ {toFaDigits(__APP_VERSION__)} · همهٔ اطلاعات فقط روی همین دستگاه ذخیره می‌شود.
        </p>
      </div>
    </>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

const PERMISSION_LABEL: Record<PermissionStatus, string> = {
  granted: 'مجاز',
  denied: 'مسدود',
  default: 'درخواست نشده',
  unsupported: 'پشتیبانی نمی‌شود',
}

function NotificationsCard() {
  const { notificationsEnabled, defaultReminderTime } = useSelector(settingsStore, (s) => s)
  const [permission, setPermission] = useState<PermissionStatus>('default')
  useEffect(() => setPermission(permissionStatus()), [])

  async function toggle(enabled: boolean) {
    if (!enabled) return updateSettings({ notificationsEnabled: false })
    const result = permission === 'granted' ? permission : await requestPermission()
    setPermission(result)
    if (result !== 'granted') {
      toast.error(result === 'denied' ? 'اجازهٔ اعلان در تنظیمات مرورگر مسدود شده است.' : 'اجازهٔ اعلان داده نشد.')
      return
    }
    updateSettings({ notificationsEnabled: true })
    void runReminderCheck()
  }

  return (
    <Section title="اعلان‌ها">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label htmlFor="notifications">نمایش اعلان یادآورها</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            وضعیت مجوز مرورگر: <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>{PERMISSION_LABEL[permission]}</Badge>
          </p>
        </div>
        <Switch
          id="notifications"
          checked={notificationsEnabled && permission === 'granted'}
          disabled={permission === 'unsupported'}
          onCheckedChange={toggle}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="default-time">ساعت پیش‌فرض یادآوری</Label>
        <p className="text-xs text-muted-foreground">زمان اعلان اقساط و آبیاری، و ساعت پیشنهادی یادآورهای جدید.</p>
        <TimeSelect id="default-time" value={defaultReminderTime} onChange={(v) => updateSettings({ defaultReminderTime: v })} />
      </div>
      {notificationsEnabled && permission === 'granted' && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            void showNotification({ title: 'یادآور زندگی', body: 'اعلان‌ها درست کار می‌کنند.', tag: 'test', path: '/settings' })
          }
        >
          ارسال اعلان آزمایشی
        </Button>
      )}
      <Alert>
        <Info />
        <AlertTitle>محدودیت اعلان‌ها</AlertTitle>
        <AlertDescription>
          <ul className="list-disc space-y-1 ps-4">
            <li>این برنامه سرور ندارد؛ اعلان‌ها فقط وقتی برنامه (یا تب آن) باز است بررسی و نمایش داده می‌شوند.</li>
            <li>مرورگرها به صفحات وب اجازهٔ زمان‌بندی اعلان در زمانی مشخص را نمی‌دهند و سرویس‌ورکر نمی‌تواند تایمر دائمی داشته باشد. اعلان در زمان بسته بودن برنامه نیازمند Web Push و سرور ارسال‌کننده است.</li>
            <li>هر بار برنامه را باز کنید، یادآورهای جاافتاده بررسی و یک‌بار اعلان می‌شوند.</li>
            <li>در آیفون (iOS ۱۶٫۴ به بالا) اعلان فقط پس از «افزودن به صفحهٔ اصلی» و اجرای برنامه از همان آیکون کار می‌کند.</li>
          </ul>
        </AlertDescription>
      </Alert>
    </Section>
  )
}

function ThemeCard() {
  const theme = useSelector(settingsStore, (s) => s.theme)
  // 'system' (the default until the first tap) resolves to whatever the OS uses.
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next = dark ? 'light' : 'dark'
    const apply = () => {
      document.documentElement.classList.toggle('dark', next === 'dark')
      flushSync(() => updateSettings({ theme: next }))
    }
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply()
    // New theme grows as a circle from the button until it covers the farthest screen corner.
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    void document.startViewTransition(apply).ready.then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      ),
    )
  }

  return (
    <Card className="flex-row items-center justify-between px-4">
      <CardTitle>ظاهر</CardTitle>
      <Button variant="secondary" size="icon" onClick={toggle} aria-label={dark ? 'پوستهٔ روشن' : 'پوستهٔ تیره'}>
        <Sun className={cn('absolute transition-all duration-500', dark && '-rotate-90 scale-0 opacity-0')} aria-hidden />
        <Moon className={cn('absolute transition-all duration-500', !dark && 'rotate-90 scale-0 opacity-0')} aria-hidden />
      </Button>
    </Card>
  )
}

function DataCard() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Backup | null>(null)

  async function exportBackup(suffix = '') {
    downloadText(await exportData(), `life-reminder-${todayIso()}${suffix}.json`)
  }

  async function confirmImport() {
    if (!pending) return
    try {
      await exportBackup('-before-import') // safety copy of what is about to be replaced
      await importData(pending)
      toast.success('اطلاعات با موفقیت بازیابی شد.')
    } catch (e) {
      toast.error(`بازیابی ناموفق بود؛ اطلاعات فعلی دست‌نخورده باقی ماند. ${e instanceof Error ? e.message : ''}`)
    } finally {
      setPending(null)
    }
  }

  const counts = pending
    ? `${toFaDigits(pending.data.installments.length)} قسط، ${toFaDigits(pending.data.plants.length)} گیاه و ${toFaDigits(pending.data.reminders.length)} یادآور`
    : ''

  return (
    <Section title="پشتیبان‌گیری" description="از اطلاعاتتان فایل JSON بگیرید و روی همین یا دستگاه دیگری بازیابی کنید.">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => void exportBackup().catch(() => toast.error('خروجی گرفتن ناموفق بود.'))}>
          <Download /> خروجی JSON
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload /> بازیابی از فایل
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label="انتخاب فایل پشتیبان"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          const result = parseBackup(await file.text())
          if (result.ok) setPending(result.backup)
          else toast.error(result.error)
        }}
      />
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="جایگزینی اطلاعات؟"
        description={`فایل شامل ${counts} است و جایگزین همهٔ اطلاعات فعلی می‌شود. پیش از جایگزینی، یک نسخهٔ پشتیبان از اطلاعات فعلی دانلود می‌شود.`}
        confirmLabel="بازیابی"
        onConfirm={() => void confirmImport()}
      />
    </Section>
  )
}

function StorageCard() {
  const db = useSelector(appStore, (s) => s.db)
  const invalid = useSelector(appStore, (s) => Object.values(s.invalidRecords).reduce((a, b) => a + b, 0))
  const [usage, setUsage] = useState<string | null>(null)
  useEffect(() => {
    void navigator.storage?.estimate?.().then(({ usage: used = 0 }) => setUsage(`${formatNumber(Math.round(used / 1024))} کیلوبایت`))
  }, [])

  return (
    <Section title="وضعیت ذخیره‌سازی">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">پایگاه داده</dt>
        <dd>{db.state === 'ready' ? 'آماده (IndexedDB)' : db.state === 'opening' ? 'در حال باز شدن…' : `خطا: ${db.message}`}</dd>
        <dt className="text-muted-foreground">ذخیرهٔ ماندگار</dt>
        <dd>
          {db.state === 'ready' && db.persisted
            ? 'فعال — مرورگر اطلاعات را خودکار پاک نمی‌کند'
            : 'تضمین نشده — مرتب پشتیبان بگیرید'}
        </dd>
        {usage && (
          <>
            <dt className="text-muted-foreground">فضای مصرفی</dt>
            <dd>{usage}</dd>
          </>
        )}
      </dl>
      {invalid > 0 && (
        <Alert variant="destructive">
          <Info />
          <AlertTitle>{toFaDigits(invalid)} رکورد نامعتبر</AlertTitle>
          <AlertDescription>
            این رکوردها حذف نشده‌اند و در فایل خروجی JSON وجود دارند، اما در برنامه نمایش داده نمی‌شوند.
          </AlertDescription>
        </Alert>
      )}
    </Section>
  )
}
