import { useIsland } from '#/modules/shell/hooks/island.hook'
import { IslandSurface } from '#/modules/shell/components/island-surface'

/** The app's Dynamic Island (islandcn): where `notify` messages appear. Mount once. */
const Island = () => {
  const { surfaceProps } = useIsland()

  return <IslandSurface {...surfaceProps} />
}

export { Island }
