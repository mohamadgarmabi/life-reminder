import { Download, Upload } from 'lucide-react'
import { ConfirmDialog } from '#/modules/shell/components/dialogs'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { useDataCard } from '#/modules/settings/hooks/data-card.hook'

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

  return (
    <SettingsSection
      title="پشتیبان‌گیری"
      description="از اطلاعاتتان فایل JSON بگیرید و روی همین یا دستگاه دیگری بازیابی کنید."
    >
      <SettingsRow icon={Download} tone="bg-emerald-500" title="خروجی JSON" onClick={handleExport} />
      <SettingsRow icon={Upload} tone="bg-blue-500" title="بازیابی از فایل" onClick={handlePickFile} />
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label="انتخاب فایل پشتیبان"
        onChange={handleFileChange}
      />
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={handleOpenChange}
        title="جایگزینی اطلاعات؟"
        description={confirmDescription}
        confirmLabel="بازیابی"
        onConfirm={handleConfirm}
      />
    </SettingsSection>
  )
}

export { DataCard }
