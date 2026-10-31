import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import PlantsView from '#/modules/plants/views/plants-view'

const PlantsRoute = () => <PlantsView />

export const Route = createFileRoute('/plants')({
  validateSearch: z.object({ new: z.boolean().optional() }),
  component: PlantsRoute,
})
