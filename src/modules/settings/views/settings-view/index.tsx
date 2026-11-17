import { PageHeader } from '#/modules/shell/components/states'
import { AccountCard } from '#/modules/account/components/account-card'
import { AnalysisCard } from '#/modules/settings/components/analysis-card'
import { DataCard } from '#/modules/settings/components/data-card'
import { LanguageCard } from '#/modules/settings/components/language-card'
import { GamesCard } from '#/modules/settings/components/games-card'
import { NotificationsCard } from '#/modules/settings/components/notifications-card'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { StorageCard } from '#/modules/settings/components/storage-card'
import { ThemeCard } from '#/modules/settings/components/theme-card'
import { TransitionsCard } from '#/modules/settings/components/transitions-card'
import { useSettings } from '#/modules/settings/hooks/settings.hook'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'

const SettingsView = () => {
  const { versionLabel } = useSettings()
  const { t } = useI18n()

  return (
    <>
      <PageHeader title={t('settings.title')} />
      <div className="space-y-6">
        <AccountCard />
        <NotificationsCard />
        <AnalysisCard />
        <SettingsSection title={t('settings.appearance')}>
          <LanguageCard />
          <ThemeCard />
          <TransitionsCard />
        </SettingsSection>
        <SettingsSection title={t('settings.fun')}>
          <GamesCard />
        </SettingsSection>
        <DataCard />
        <StorageCard />
        <p className="pt-2 text-center text-xs text-muted-foreground">
          {t('settings.footer', { version: versionLabel })}
        </p>
      </div>
    </>
  )
}

export default SettingsView
