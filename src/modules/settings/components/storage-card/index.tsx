import { Database, HardDrive, Info, ShieldCheck } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '#/components/alert'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { useStorageCard } from '#/modules/settings/hooks/storage-card.hook'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'

const value = (text: string) => <span className="text-sm text-muted-foreground">{text}</span>

const StorageCard = () => {
  const { dbStatusLabel, persistenceLabel, usage, hasInvalid, invalidTitle } = useStorageCard()
  const { t } = useI18n()

  return (
    <SettingsSection title={t('settings.storage.title')}>
      <SettingsRow
        icon={Database}
        tone="bg-slate-500"
        title={t('settings.storage.database')}
        description={<bdi>{dbStatusLabel}</bdi>}
      />
      <SettingsRow
        icon={ShieldCheck}
        tone="bg-teal-500"
        title={t('settings.storage.persistence')}
        description={persistenceLabel}
      />
      {usage && (
        <SettingsRow icon={HardDrive} tone="bg-gray-500" title={t('settings.storage.usage')} trailing={value(usage)} />
      )}
      {hasInvalid && (
        <div className="p-3">
          <Alert variant="destructive">
            <Info />
            <AlertTitle>{invalidTitle}</AlertTitle>
            <AlertDescription>{t('settings.storage.invalidHint')}</AlertDescription>
          </Alert>
        </div>
      )}
    </SettingsSection>
  )
}

export { StorageCard }
