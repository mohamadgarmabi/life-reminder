import { DatabaseZap } from 'lucide-react'
import { EmptyState } from '#/modules/shell/components/states'
import { Button } from '#/components/button'
import { useStorageError } from '#/modules/shell/hooks/shell.hook'
import { t } from '#/modules/shell/utils/i18n'

const StorageError = ({ message }: { message: string }) => {
  const { description, handleRetry } = useStorageError(message)
  return (
    <EmptyState
      icon={DatabaseZap}
      title={t('shell.storage.title')}
      description={description}
      action={<Button onClick={handleRetry}>{t('common.retry')}</Button>}
    />
  )
}

export { StorageError }
