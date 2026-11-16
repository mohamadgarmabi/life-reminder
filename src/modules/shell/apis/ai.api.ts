import { createFetch } from 'tanstack-fetch'
import { z } from 'zod'

// Same Cloudflare worker as the push relay (push-worker/), which also hosts the free Workers AI calls.
const AI_URL = import.meta.env.VITE_PUSH_URL?.replace(/\/$/, '')

const isAiAvailable = !!AI_URL

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type AiTextBody = { mode: 'analysis'; data: string } | { mode: 'tutor'; topic: string; messages: ChatMessage[] }

const replySchema = z.object({ text: z.string().min(1) })

/** Text-only AI (status analysis, plan tutor); returns the model's Persian reply. */
const askAiText = async (body: AiTextBody) => {
  if (!AI_URL) throw new Error('سرویس هوش مصنوعی پیکربندی نشده است.')
  try {
    return replySchema.parse(await createFetch({ baseUrl: AI_URL }).post('/ai-text', { body })).text
  } catch {
    throw new Error('پاسخی از هوش مصنوعی نگرفتیم؛ اتصال اینترنت را بررسی کنید.')
  }
}

export { AI_URL, isAiAvailable, askAiText }
export type { ChatMessage }
