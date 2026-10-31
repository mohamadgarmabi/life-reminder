import { Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '#/modules/shell/components/ui/alert'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { useStorageCard } from '#/modules/settings/hooks/storage-card.hook'

const StorageCard = () => {
  const { dbStatusLabel, persistenceLabel, usage, hasInvalid, invalidTitle } = useStorageCard()

  return (
    <SettingsSection title="وضعیت ذخیره‌سازی">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">پایگاه داده</dt>
        <dd>{dbStatusLabel}</dd>
        <dt className="text-muted-foreground">ذخیرهٔ ماندگار</dt>
        <dd>{persistenceLabel}</dd>
        {usage && (
          <>
            <dt className="text-muted-foreground">فضای مصرفی</dt>
            <dd>{usage}</dd>
          </>
        )}
      </dl>
      {hasInvalid && (
        <Alert variant="destructive">
          <Info />
          <AlertTitle>{invalidTitle}</AlertTitle>
          <AlertDescription>
            این رکوردها حذف نشده‌اند و در فایل خروجی JSON وجود دارند، اما در برنامه نمایش داده نمی‌شوند.
          </AlertDescription>
        </Alert>
      )}
    </SettingsSection>
  )
}

export { StorageCard }
