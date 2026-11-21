import { createFetch } from 'tanstack-fetch'
import { z } from 'zod'
import { DATA_STORES } from '#/modules/database/utils/database.schema'
import { AI_URL } from '#/modules/shell/apis/ai.api'
import type { SyncChange } from '#/modules/account/types'

const api = () => createFetch({ baseUrl: AI_URL ?? '' })

const pullSchema = z.object({
  familyId: z.string(),
  records: z.array(
    z.object({ store: z.enum(DATA_STORES), id: z.string(), data: z.string().nullable(), seq: z.number() }),
  ),
  more: z.boolean(),
})

/** Every change after `since` (all pages). Throws on network/auth errors. */
const pullChanges = async (session: string, since: number) => {
  const records: z.infer<typeof pullSchema>['records'] = []
  let cursor = since
  for (;;) {
    const page = pullSchema.parse(await api().post<unknown>('/data/pull', { body: { session, since: cursor } }))
    records.push(...page.records)
    cursor = page.records.at(-1)?.seq ?? cursor
    if (!page.more) return { familyId: page.familyId, records, cursor }
  }
}

const pushChanges = async (session: string, changes: SyncChange[]) => {
  await api().post('/data/push', { body: { session, changes } })
}

export { pullChanges, pushChanges }
