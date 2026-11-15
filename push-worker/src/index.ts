// Life Reminder push relay: the app uploads its upcoming notifications, a cron sends them on time.
import { z } from 'zod'
import { sendPush, type Vapid } from './web-push'

// Minimal D1 surface (avoids pulling @cloudflare/workers-types into the app's DOM typecheck).
interface D1Statement {
  bind: (...values: unknown[]) => D1Statement
  all: <T>() => Promise<{ results: T[] }>
}
interface D1Database {
  prepare: (sql: string) => D1Statement
  batch: (statements: D1Statement[]) => Promise<unknown>
}

interface Ai {
  run: (model: string, input: unknown) => Promise<{ response?: unknown }>
}

interface Env {
  DB: D1Database
  AI: Ai
  VAPID_PUBLIC_KEY: string
  VAPID_PRIVATE_KEY: string
  VAPID_SUBJECT: string
  /** Origin of the app (e.g. https://user.github.io); "*" when unset. */
  ALLOWED_ORIGIN?: string
}

const text = z.string().max(500)
const syncSchema = z.object({
  subscription: z.object({
    endpoint: z.url({ protocol: /^https$/ }).max(1000),
    keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }),
  }),
  items: z
    .array(
      z.object({
        at: z.number().int(),
        title: text,
        body: text,
        tag: text,
        url: text,
        keys: z.array(text).max(20),
      }),
    )
    .max(500),
})

// Free tier of Workers AI; vision-capable, accepts the image as a data URL.
const VISION_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct'

const plantAiSchema = z.object({
  mode: z.enum(['identify', 'diagnose']),
  // The app sends ≤640px JPEGs (~100 KB); the cap only stops abuse.
  image: z.string().startsWith('data:image/').max(1_500_000),
})

const PROMPTS = {
  identify: `You are a houseplant expert. Identify the plant in the photo and reply ONLY with JSON:
{"name": string, "wateringIntervalDays": integer 1-60, "care": string}
"name": common Persian name (scientific name in parentheses).
"wateringIntervalDays": typical indoor watering interval in days.
"care": concise Persian care guide, one line each for: light, watering, soil, temperature/humidity, fertilizer, one pro tip.
If no plant is visible, use name "" and wateringIntervalDays 7.`,
  diagnose: `You are a plant doctor. Examine the plant in the photo for diseases, pests, nutrient deficiencies,
over/under-watering, light or temperature stress. Reply ONLY with JSON:
{"name": string, "healthy": boolean, "summary": string, "problems": [{"title": string, "cause": string, "fix": string}]}
All text in Persian. "name": common Persian name. "problems": empty when healthy, most likely first, at most 4.
"fix": practical step-by-step treatment for home growers.`,
}

/** Models sometimes wrap JSON in prose or code fences; take the outermost object. */
const extractJson = (response: unknown) => {
  if (typeof response === 'object' && response) return response
  const text = String(response ?? '')
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0]) as unknown
  } catch {
    return null
  }
}

const handlePlantAi = async (request: Request, env: Env) => {
  const parsed = plantAiSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return new Response('invalid body', { status: 400, headers: cors(env) })
  const { mode, image } = parsed.data
  const result = await env.AI.run(VISION_MODEL, {
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPTS[mode] },
          { type: 'image_url', image_url: { url: image } },
        ],
      },
    ],
    max_tokens: 1024,
    temperature: 0.2,
  }).catch((e: unknown) => {
    console.error('ai failed', e)
    return null
  })
  const json = extractJson(result?.response)
  if (!json) return new Response('ai failed', { status: 502, headers: cors(env) })
  return Response.json(json, { headers: cors(env) })
}

const sha256Hex = async (s: string) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

const cors = (env: Env) => ({
  'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN ?? '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
})

const handleSync = async (request: Request, env: Env) => {
  const parsed = syncSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return new Response('invalid body', { status: 400, headers: cors(env) })
  const { subscription, items } = parsed.data
  const id = await sha256Hex(subscription.endpoint)
  const now = Date.now()

  // Full replace: the app is the source of truth for its own schedule.
  const statements = [env.DB.prepare('DELETE FROM items WHERE sub_id = ?').bind(id)]
  if (items.length) {
    statements.push(
      env.DB.prepare('INSERT OR REPLACE INTO subs (id, sub) VALUES (?, ?)').bind(id, JSON.stringify(subscription)),
    )
    for (const { at, ...payload } of items) {
      if (at <= now) continue // already due: the open app shows it itself
      statements.push(
        env.DB.prepare('INSERT INTO items (sub_id, fire_at, payload) VALUES (?, ?, ?)').bind(
          id,
          at,
          JSON.stringify(payload),
        ),
      )
    }
  } else {
    statements.push(env.DB.prepare('DELETE FROM subs WHERE id = ?').bind(id))
  }
  await env.DB.batch(statements)
  return new Response(null, { status: 204, headers: cors(env) })
}

const sendDue = async (env: Env) => {
  const vapid: Vapid = {
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
    subject: env.VAPID_SUBJECT,
  }
  const { results } = await env.DB.prepare(
    'SELECT items.rowid AS rid, items.sub_id AS subId, items.payload, subs.sub FROM items JOIN subs ON subs.id = items.sub_id WHERE items.fire_at <= ?',
  )
    .bind(Date.now())
    .all<{ rid: number; subId: string; payload: string; sub: string }>()

  for (const row of results) {
    const res = await sendPush(JSON.parse(row.sub), row.payload, vapid).catch(() => null)
    if (!res || res.status >= 500 || res.status === 429) continue // transient: retry next minute
    if (res.status === 404 || res.status === 410) {
      // Subscription is gone (app removed / permission revoked).
      await env.DB.batch([
        env.DB.prepare('DELETE FROM items WHERE sub_id = ?').bind(row.subId),
        env.DB.prepare('DELETE FROM subs WHERE id = ?').bind(row.subId),
      ])
      continue
    }
    if (!res.ok) console.error('push rejected', res.status, await res.text())
    await env.DB.batch([env.DB.prepare('DELETE FROM items WHERE rowid = ?').bind(row.rid)])
  }
}

const worker = {
  fetch: async (request: Request, env: Env) => {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(env) })
    const path = new URL(request.url).pathname
    if (request.method === 'POST' && path === '/sync') return handleSync(request, env)
    if (request.method === 'POST' && path === '/plant-ai') return handlePlantAi(request, env)
    return new Response('not found', { status: 404, headers: cors(env) })
  },
  scheduled: (_event: unknown, env: Env) => sendDue(env),
}

export default worker
