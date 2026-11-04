import type { AdventureWorld } from '#/modules/games/adventure/types'
import { AdventureGame } from '#/modules/games/adventure/components/adventure-game'
import { ISLAND_DATA } from '#/modules/games/adventure/worlds/forgotten-island/content'
import { IslandScene } from '#/modules/games/adventure/worlds/forgotten-island/scene/island'

const island: AdventureWorld = { ...ISLAND_DATA, Scene: IslandScene }

const ForgottenIslandView = () => <AdventureGame world={island} />

export default ForgottenIslandView
