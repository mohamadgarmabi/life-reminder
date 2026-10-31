import { DatabaseZap } from 'lucide-react'
import { EmptyState } from '#/modules/shell/components/states'
import { Button } from '#/modules/shell/components/ui/button'
import { useStorageError } from '#/modules/shell/hooks/shell.hook'

const StorageError = ({ message }: { message: string }) => {
  const { description, handleRetry } = useStorageError(message)
  return (
    <EmptyState
      icon={DatabaseZap}
      title="دسترسی به حافظهٔ دستگاه ممکن نیست"
      description={description}
      action={<Button onClick={handleRetry}>تلاش دوباره</Button>}
    />
  )
}

export { StorageError }
