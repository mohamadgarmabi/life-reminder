import { Outlet } from '@tanstack/react-router'
import { AppShell } from '#/modules/shell/components/app-shell'
import { StorageError } from '#/modules/shell/components/storage-error'
import { Toaster } from '#/modules/shell/components/ui/sonner'
import { UpdatePrompt } from '#/modules/shell/components/update-prompt'
import { useRootApp } from '#/modules/shell/hooks/shell.hook'

const RootApp = () => {
  const { isDbError, dbErrorMessage } = useRootApp()

  return (
    <AppShell>
      {isDbError && <StorageError message={dbErrorMessage} />}
      {!isDbError && <Outlet />}
      <Toaster />
      <UpdatePrompt />
    </AppShell>
  )
}

export { RootApp }
