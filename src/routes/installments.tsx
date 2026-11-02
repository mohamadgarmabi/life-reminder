import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import InstallmentsView from '#/modules/installments/views/installments-view'

const InstallmentsRoute = () => <InstallmentsView />

export const Route = createFileRoute('/installments')({
  // A malformed ?new (hand-typed links like ?new=1) is dropped: a failed validation sends the router into an endless error loop.
  validateSearch: z.object({ new: z.boolean().optional().catch(undefined) }),
  component: InstallmentsRoute,
})
