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

interface Env {
  DB: D1Database
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
    if (request.method === 'POST' && new URL(request.url).pathname === '/sync') return handleSync(request, env)
    return new Response('not found', { status: 404, headers: cors(env) })
  },
  scheduled: (_event: unknown, env: Env) => sendDue(env),
}

export default worker
