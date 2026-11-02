import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import RemindersView from '#/modules/reminders/views/reminders-view'

const RemindersRoute = () => <RemindersView />

export const Route = createFileRoute('/reminders')({
  // A malformed ?new (hand-typed links like ?new=1) is dropped: a failed validation sends the router into an endless error loop.
  validateSearch: z.object({ new: z.boolean().optional().catch(undefined) }),
  component: RemindersRoute,
})
