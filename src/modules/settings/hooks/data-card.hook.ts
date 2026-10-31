import { useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { downloadText, exportData, importData, parseBackup } from '#/modules/settings/apis/backup.api'
import type { Backup } from '#/modules/settings/types'
import { todayIso } from '#/modules/shell/utils/dates'
import { toFaDigits } from '#/modules/shell/utils/format'

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

  const handleExport = () => void exportBackup().catch(() => toast.error('خروجی گرفتن ناموفق بود.'))

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
    confirmDescription: `فایل شامل ${counts} است و جایگزین همهٔ اطلاعات فعلی می‌شود. پیش از جایگزینی، یک نسخهٔ پشتیبان از اطلاعات فعلی دانلود می‌شود.`,
    handleExport,
    handlePickFile,
    handleFileChange,
    handleOpenChange,
    handleConfirm,
  }
}

export { useDataCard }
