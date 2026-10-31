import { createFileRoute } from '@tanstack/react-router'
import HomeView from '#/modules/dashboard/views/home-view'

const HomeRoute = () => <HomeView />

export const Route = createFileRoute('/')({
  component: HomeRoute,
})
