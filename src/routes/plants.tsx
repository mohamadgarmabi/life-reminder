import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import PlantsView from '#/modules/plants/views/plants-view'

const PlantsRoute = () => <PlantsView />

export const Route = createFileRoute('/plants')({
  // A malformed ?new (hand-typed links like ?new=1) is dropped: a failed validation sends the router into an endless error loop.
  validateSearch: z.object({ new: z.boolean().optional().catch(undefined) }),
  component: PlantsRoute,
})
