import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import PlansView from '#/modules/plans/views/plans-view'

const PlansRoute = () => <PlansView />

export const Route = createFileRoute('/plans')({
  // A malformed ?new is dropped: a failed validation sends the router into an endless error loop.
  validateSearch: z.object({ new: z.boolean().optional().catch(undefined) }),
  component: PlansRoute,
})
