import { PageHeader } from '#/modules/shell/components/states'
import { DataCard } from '#/modules/settings/components/data-card'
import { GamesCard } from '#/modules/settings/components/games-card'
import { NotificationsCard } from '#/modules/settings/components/notifications-card'
import { StorageCard } from '#/modules/settings/components/storage-card'
import { ThemeCard } from '#/modules/settings/components/theme-card'
import { useSettings } from '#/modules/settings/hooks/settings.hook'

const SettingsView = () => {
  const { versionLabel } = useSettings()

  return (
    <>
      <PageHeader title="تنظیمات" />
      <div className="space-y-4">
        <NotificationsCard />
        <ThemeCard />
        <GamesCard />
        <DataCard />
        <StorageCard />
        <p className="pt-2 text-center text-xs text-muted-foreground">
          یادآور زندگی · نسخهٔ {versionLabel} · همهٔ اطلاعات فقط روی همین دستگاه ذخیره می‌شود.
        </p>
      </div>
    </>
  )
}

export default SettingsView
