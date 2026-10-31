import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import InstallmentsView from '#/modules/installments/views/installments-view'

const InstallmentsRoute = () => <InstallmentsView />

export const Route = createFileRoute('/installments')({
  validateSearch: z.object({ new: z.boolean().optional() }),
  component: InstallmentsRoute,
})
