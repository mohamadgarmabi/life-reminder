import { ClientOnly } from '@tanstack/react-router'
import { RootApp } from '#/modules/shell/components/root-app'
import { ListSkeleton } from '#/modules/shell/components/states'

// All content depends on on-device data and the current URL, so the prerendered shell is only a
// loading placeholder; rendering the app client-side avoids shell/route hydration mismatches.
const RootView = () => {
  return (
    <ClientOnly
      fallback={
        <div className="mx-auto max-w-lg p-4 pt-8">
          <ListSkeleton />
        </div>
      }
    >
      <RootApp />
    </ClientOnly>
  )
}

export default RootView
