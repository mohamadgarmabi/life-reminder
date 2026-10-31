import { useSelector } from '@tanstack/react-store'
import { useEffect, useState } from 'react'
import { appStore } from '#/modules/shell/stores/shell.store'
import { formatNumber, toFaDigits } from '#/modules/shell/utils/format'

const useStorageCard = () => {
  const db = useSelector(appStore, (s) => s.db)
  const invalid = useSelector(appStore, (s) => Object.values(s.invalidRecords).reduce((a, b) => a + b, 0))
  const [usage, setUsage] = useState<string | null>(null)
  useEffect(() => {
    void navigator.storage
      ?.estimate?.()
      .then(({ usage: used = 0 }) => setUsage(`${formatNumber(Math.round(used / 1024))} کیلوبایت`))
  }, [])

  return {
    dbStatusLabel:
      db.state === 'ready' ? 'آماده (IndexedDB)' : db.state === 'opening' ? 'در حال باز شدن…' : `خطا: ${db.message}`,
    persistenceLabel:
      db.state === 'ready' && db.persisted
        ? 'فعال — مرورگر اطلاعات را خودکار پاک نمی‌کند'
        : 'تضمین نشده — مرتب پشتیبان بگیرید',
    usage,
    hasInvalid: invalid > 0,
    invalidTitle: `${toFaDigits(invalid)} رکورد نامعتبر`,
  }
}

export { useStorageCard }
