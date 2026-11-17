import { Download, Upload } from 'lucide-react'
import { ConfirmDialog } from '#/modules/shell/components/dialogs'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { useDataCard } from '#/modules/settings/hooks/data-card.hook'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'

const DataCard = () => {
  const {
    fileRef,
    isConfirmOpen,
    confirmDescription,
    handleExport,
    handlePickFile,
    handleFileChange,
    handleOpenChange,
    handleConfirm,
  } = useDataCard()
  const { t } = useI18n()

  return (
    <SettingsSection title={t('settings.data.title')} description={t('settings.data.description')}>
      <SettingsRow icon={Download} tone="bg-emerald-500" title={t('settings.data.export')} onClick={handleExport} />
      <SettingsRow icon={Upload} tone="bg-blue-500" title={t('settings.data.import')} onClick={handlePickFile} />
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label={t('settings.data.pickFile')}
        onChange={handleFileChange}
      />
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={handleOpenChange}
        title={t('settings.data.confirmTitle')}
        description={confirmDescription}
        confirmLabel={t('settings.data.confirmLabel')}
        onConfirm={handleConfirm}
      />
    </SettingsSection>
  )
}

export { DataCard }
