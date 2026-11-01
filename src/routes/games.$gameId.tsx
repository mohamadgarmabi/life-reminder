import { Suspense, lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BackButton } from '#/modules/games/components/back-button'
import { EmptyState, ListSkeleton } from '#/modules/shell/components/states'
import { Gamepad2 } from 'lucide-react'

// One chunk per game; the service worker precaches them all, so every game works offline.
const VIEWS = {
  runner: lazy(() => import('#/modules/games/views/runner-view')),
  snake: lazy(() => import('#/modules/games/views/snake-view')),
  blocks: lazy(() => import('#/modules/games/views/blocks-view')),
  breakout: lazy(() => import('#/modules/games/views/breakout-view')),
  firefly: lazy(() => import('#/modules/games/views/firefly-view')),
  meteor: lazy(() => import('#/modules/games/views/meteor-view')),
  merge: lazy(() => import('#/modules/games/views/merge-view')),
  mines: lazy(() => import('#/modules/games/views/mines-view')),
  memory: lazy(() => import('#/modules/games/views/memory-view')),
  water: lazy(() => import('#/modules/games/views/water-view')),
  connect4: lazy(() => import('#/modules/games/views/connect4-view')),
}

const GameRoute = () => {
  const { gameId } = Route.useParams()
  const View = VIEWS[gameId as keyof typeof VIEWS] as (typeof VIEWS)[keyof typeof VIEWS] | undefined
  if (!View)
    return (
      <EmptyState
        icon={Gamepad2}
        title="بازی پیدا نشد"
        description="این بازی وجود ندارد."
        action={<BackButton to="/games" label="بازی‌ها" />}
      />
    )
  return (
    <Suspense fallback={<ListSkeleton />}>
      <View />
    </Suspense>
  )
}

export const Route = createFileRoute('/games/$gameId')({
  component: GameRoute,
})
