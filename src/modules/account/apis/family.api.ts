import { createFetch } from 'tanstack-fetch'
import { z } from 'zod'
import { AI_URL } from '#/modules/shell/apis/ai.api'

const api = () => createFetch({ baseUrl: AI_URL ?? '' })

const familySchema = z.object({
  me: z.string(),
  members: z.array(z.string()),
  /** Invites this account received from other families. */
  received: z.array(z.object({ familyId: z.string(), from: z.string() })),
  /** Emails my family has invited that haven't joined yet. */
  sent: z.array(z.string()),
})

const fetchFamily = async (session: string) =>
  familySchema.parse(await api().post<unknown>('/family', { body: { session } }))

const inviteToFamily = (session: string, email: string) => api().post('/family/invite', { body: { session, email } })

const cancelInvite = (session: string, email: string) => api().post('/family/cancel', { body: { session, email } })

const acceptInvite = (session: string, familyId: string) =>
  api().post('/family/accept', { body: { session, familyId } })

const leaveFamily = (session: string) => api().post('/family/leave', { body: { session } })

export { familySchema, fetchFamily, inviteToFamily, cancelInvite, acceptInvite, leaveFamily }
