import type { z } from 'zod'
import type { googleAccountSchema } from '#/modules/account/apis/google-account.api'
import type { familySchema } from '#/modules/account/apis/family.api'
import type { DataStore } from '#/modules/database/types'

type GoogleAccount = z.infer<typeof googleAccountSchema>

/** One record sent to the account; data null = deleted. */
interface SyncChange {
  store: DataStore
  id: string
  data: string | null
}

type Family = z.infer<typeof familySchema>

export type { GoogleAccount, SyncChange, Family }
