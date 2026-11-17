import { useRef, useState, type ChangeEvent } from 'react'
import { toast } from '#/components/sonner'
import { downloadText, exportData, importData, parseBackup } from '#/modules/settings/apis/backup.api'
import type { Backup } from '#/modules/settings/types'
import { todayIso } from '#/modules/shell/utils/dates'
import { toLocalDigits } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'

const useDataCard = () => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Backup | null>(null)

  const exportBackup = async (suffix = '') => {
    downloadText(await exportData(), `life-reminder-${todayIso()}${suffix}.json`)
  }

  const confirmImport = async () => {
    if (!pending) return
    try {
      await exportBackup('-before-import') // safety copy of what is about to be replaced
      await importData(pending)
      toast.success(t('settings.data.importSuccess'))
    } catch (e) {
      toast.error(t('settings.data.importFailed', { error: e instanceof Error ? e.message : '' }))
    } finally {
      setPending(null)
    }
  }

  const confirmDescription = pending
    ? t('settings.data.confirmDescription', {
        installments: toLocalDigits(pending.data.installments.length),
        plants: toLocalDigits(pending.data.plants.length),
        reminders: toLocalDigits(pending.data.reminders.length),
        plans: toLocalDigits(pending.data.plans.length),
      })
    : ''

  const handleExport = () => void exportBackup().catch(() => toast.error(t('settings.data.exportFailed')))

  const handlePickFile = () => fileRef.current?.click()

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const result = parseBackup(await file.text())
    if (result.ok) setPending(result.backup)
    else toast.error(result.error)
  }

  const handleOpenChange = (o: boolean) => !o && setPending(null)

  const handleConfirm = () => void confirmImport()

  return {
    fileRef,
    isConfirmOpen: !!pending,
    confirmDescription,
    handleExport,
    handlePickFile,
    handleFileChange,
    handleOpenChange,
    handleConfirm,
  }
}

export { useDataCard }
