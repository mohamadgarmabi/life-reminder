import { createFileRoute } from '@tanstack/react-router'
import Match3View from '#/modules/games/views/match3-view'

const Match3Route = () => <Match3View />

export const Route = createFileRoute('/games/match3')({
  component: Match3Route,
})
