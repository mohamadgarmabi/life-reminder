import { createFetch } from 'tanstack-fetch'
import { z } from 'zod'
import { getLanguage, t } from '#/modules/shell/utils/i18n'

// Same Cloudflare worker as the push relay (push-worker/), which also hosts the free Workers AI calls.
const AI_URL = import.meta.env.VITE_PUSH_URL?.replace(/\/$/, '')

const isAiAvailable = !!AI_URL

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type AiTextBody = { mode: 'analysis'; data: string } | { mode: 'tutor'; topic: string; messages: ChatMessage[] }

const replySchema = z.object({ text: z.string().min(1) })

/** Text-only AI (status analysis, plan tutor); the worker replies in the app's language. */
const askAiText = async (body: AiTextBody) => {
  if (!AI_URL) throw new Error(t('shell.ai.notConfigured'))
  try {
    const request = { ...body, lang: getLanguage() }
    return replySchema.parse(await createFetch({ baseUrl: AI_URL }).post('/ai-text', { body: request })).text
  } catch {
    throw new Error(t('shell.ai.noReply'))
  }
}

export { AI_URL, isAiAvailable, askAiText }
export type { ChatMessage }
