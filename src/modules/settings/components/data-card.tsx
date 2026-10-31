import { Download, Upload } from 'lucide-react'
import { ConfirmDialog } from '#/modules/shell/components/dialogs'
import { Button } from '#/modules/shell/components/ui/button'
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
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={handleExport}>
          <Download /> خروجی JSON
        </Button>
        <Button variant="outline" onClick={handlePickFile}>
          <Upload /> بازیابی از فایل
        </Button>
      </div>
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
