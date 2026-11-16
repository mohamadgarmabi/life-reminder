import type { z } from 'zod'
import type { googleAccountSchema } from '#/modules/account/apis/google-account.api'

type GoogleAccount = z.infer<typeof googleAccountSchema>

export type { GoogleAccount }
