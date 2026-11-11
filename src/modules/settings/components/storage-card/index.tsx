import { Database, HardDrive, Info, ShieldCheck } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '#/components/alert'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { useStorageCard } from '#/modules/settings/hooks/storage-card.hook'

const value = (text: string) => <span className="text-sm text-muted-foreground">{text}</span>

const StorageCard = () => {
  const { dbStatusLabel, persistenceLabel, usage, hasInvalid, invalidTitle } = useStorageCard()

  return (
    <SettingsSection title="وضعیت ذخیره‌سازی">
      <SettingsRow icon={Database} tone="bg-slate-500" title="پایگاه داده" trailing={value(dbStatusLabel)} />
      <SettingsRow icon={ShieldCheck} tone="bg-teal-500" title="ذخیرهٔ ماندگار" trailing={value(persistenceLabel)} />
      {usage && <SettingsRow icon={HardDrive} tone="bg-gray-500" title="فضای مصرفی" trailing={value(usage)} />}
      {hasInvalid && (
        <div className="p-3">
          <Alert variant="destructive">
            <Info />
            <AlertTitle>{invalidTitle}</AlertTitle>
            <AlertDescription>
              این رکوردها حذف نشده‌اند و در فایل خروجی JSON وجود دارند، اما در برنامه نمایش داده نمی‌شوند.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </SettingsSection>
  )
}

export { StorageCard }
