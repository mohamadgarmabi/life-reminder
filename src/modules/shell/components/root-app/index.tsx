import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from '@tanstack/react-router'
import { AppShell } from '#/modules/shell/components/app-shell'
import { StorageError } from '#/modules/shell/components/storage-error'
import { Toaster } from '#/components/sonner'
import { UpdatePrompt } from '#/modules/shell/components/update-prompt'
import { useRootApp } from '#/modules/shell/hooks/shell.hook'

// Network data only (market prices); on-device data goes through the database hooks.
const queryClient = new QueryClient()

const RootApp = () => {
  const { isDbError, dbErrorMessage } = useRootApp()

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        {isDbError && <StorageError message={dbErrorMessage} />}
        {!isDbError && <Outlet />}
        <Toaster />
        <UpdatePrompt />
      </AppShell>
    </QueryClientProvider>
  )
}

export { RootApp }
