import { useSelector } from '@tanstack/react-store'
import { useEffect, useState } from 'react'
import { appStore } from '#/modules/shell/stores/shell.store'
import { formatNumber, toLocalDigits } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'

const useStorageCard = () => {
  const db = useSelector(appStore, (s) => s.db)
  const invalid = useSelector(appStore, (s) => Object.values(s.invalidRecords).reduce((a, b) => a + b, 0))
  const [usage, setUsage] = useState<string | null>(null)
  useEffect(() => {
    void navigator.storage
      ?.estimate?.()
      .then(({ usage: used = 0 }) => setUsage(t('settings.storage.kb', { n: formatNumber(Math.round(used / 1024)) })))
  }, [])

  return {
    dbStatusLabel:
      db.state === 'ready'
        ? t('settings.storage.ready')
        : db.state === 'opening'
          ? t('settings.storage.opening')
          : t('settings.storage.error', { message: db.message }),
    persistenceLabel:
      db.state === 'ready' && db.persisted ? t('settings.storage.persisted') : t('settings.storage.notPersisted'),
    usage,
    hasInvalid: invalid > 0,
    invalidTitle: t('settings.storage.invalidTitle', { n: toLocalDigits(invalid) }),
  }
}

export { useStorageCard }
