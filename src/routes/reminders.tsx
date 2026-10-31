import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import RemindersView from '#/modules/reminders/views/reminders-view'

const RemindersRoute = () => <RemindersView />

export const Route = createFileRoute('/reminders')({
  validateSearch: z.object({ new: z.boolean().optional() }),
  component: RemindersRoute,
})
