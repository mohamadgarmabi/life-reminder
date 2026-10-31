import { createFileRoute } from '@tanstack/react-router'
import GamesView from '#/modules/games/views/games-view'

const GamesRoute = () => <GamesView />

export const Route = createFileRoute('/games/')({
  component: GamesRoute,
})
