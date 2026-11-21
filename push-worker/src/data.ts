// Account data sync + family sharing. Identity = the verified Google email behind the app's session id.
import { z } from 'zod'
import { sha256Hex } from './hash'

interface D1Statement {
  bind: (...values: unknown[]) => D1Statement
  all: <T>() => Promise<{ results: T[] }>
}

interface DataEnv {
  DB: { prepare: (sql: string) => D1Statement; batch: (statements: D1Statement[]) => Promise<unknown> }
  /** Optional comma-separated allow list; an invited email is always allowed. Unset = any Google account. */
  ALLOWED_EMAILS?: string
}

// Must match DATA_STORES in src/modules/database/utils/database.schema.ts.
const STORES = ['installments', 'payments', 'plants', 'waterings', 'reminders', 'reminderEvents', 'plans'] as const

const PAGE = 500
const session = z.string().regex(/^[a-f0-9]{64}$/)
const email = z
  .email()
  .max(254)
  .transform((e) => e.toLowerCase())

const pullBody = z.object({ session, since: z.number().int().min(0) })
const pushBody = z.object({
  session,
  changes: z
    .array(
      z.object({
        store: z.enum(STORES),
        id: z.string().min(1).max(100),
        // Plant photos are downscaled data URLs; this keeps every row well under D1's row limit.
        data: z.string().max(1_500_000).nullable(),
      }),
    )
    .max(200),
})
const inviteBody = z.object({ session, email })
const acceptBody = z.object({ session, familyId: z.uuid() })
const sessionBody = z.object({ session })

type Ctx = { env: DataEnv; headers: Record<string, string> }

const rows = async <T>(env: DataEnv, sql: string, ...args: unknown[]) =>
  (
    await env.DB.prepare(sql)
      .bind(...args)
      .all<T>()
  ).results

const familyOf = async (env: DataEnv, user: string) => {
  const found = (await rows<{ family_id: string }>(env, 'SELECT family_id FROM members WHERE email = ?1', user))[0]
  if (found) return found.family_id
  const id = crypto.randomUUID()
  await rows(env, 'INSERT INTO members (email, family_id) VALUES (?1, ?2) ON CONFLICT(email) DO NOTHING', user, id)
  return (await rows<{ family_id: string }>(env, 'SELECT family_id FROM members WHERE email = ?1', user))[0].family_id
}

const isAllowed = async (env: DataEnv, user: string) => {
  const list = env.ALLOWED_EMAILS?.split(',').map((e) => e.trim().toLowerCase())
  if (!list?.filter(Boolean).length || list.includes(user)) return true
  const member = await rows(env, 'SELECT 1 FROM members WHERE email = ?1', user)
  const invited = await rows(env, 'SELECT 1 FROM invites WHERE email = ?1', user)
  return member.length > 0 || invited.length > 0
}

/** The signed-in, allowed user's email, or the error response to return. */
const authenticate = async ({ env, headers }: Ctx, sessionId: string) => {
  const row = (
    await rows<{ email: string | null }>(
      env,
      'SELECT email FROM google_tokens WHERE session_hash = ?1',
      await sha256Hex(sessionId),
    )
  )[0]
  // No verified email (see profileFromIdToken) = not a usable identity.
  if (!row?.email) return { error: Response.json({ error: 'unauthorized' }, { status: 401, headers }) }
  const user = row.email.toLowerCase()
  if (!(await isAllowed(env, user))) return { error: Response.json({ error: 'forbidden' }, { status: 403, headers }) }
  return { user }
}

const parse = async <T extends z.ZodType>(request: Request, schema: T, ctx: Ctx) => {
  const body = schema.safeParse(await request.json().catch(() => null))
  if (!body.success) return { error: new Response('invalid body', { status: 400, headers: ctx.headers }) }
  const auth = await authenticate(ctx, (body.data as { session: string }).session)
  if ('error' in auth) return { error: auth.error }
  return { body: body.data as z.infer<T>, user: auth.user }
}

/** Copies every live record of one family into another (ids are UUIDs, so they don't collide). */
const copyRecords = async (env: DataEnv, from: string, to: string) => {
  await rows(
    env,
    `INSERT INTO records (family_id, store, id, data, seq)
     SELECT ?1, store, id, data,
       (SELECT COALESCE(MAX(seq), 0) FROM records WHERE family_id = ?1) + ROW_NUMBER() OVER (ORDER BY seq)
     FROM records WHERE family_id = ?2 AND data IS NOT NULL
     ON CONFLICT(family_id, store, id) DO UPDATE SET data = excluded.data, seq = excluded.seq`,
    to,
    from,
  )
}

/** Moves a user to another family; their old family's data is copied over, and dropped if nobody is left there. */
const moveUser = async (env: DataEnv, user: string, from: string, to: string) => {
  await copyRecords(env, from, to)
  await rows(env, 'UPDATE members SET family_id = ?1 WHERE email = ?2', to, user)
  const left = await rows(env, 'SELECT 1 FROM members WHERE family_id = ?1', from)
  if (!left.length) {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM records WHERE family_id = ?1').bind(from),
      env.DB.prepare('DELETE FROM invites WHERE family_id = ?1').bind(from),
    ])
  }
}

/** POST /data/pull — changes after `since`, oldest first, one page at a time. */
const handlePull = async (request: Request, ctx: Ctx) => {
  const p = await parse(request, pullBody, ctx)
  if ('error' in p) return p.error
  const family = await familyOf(ctx.env, p.user)
  const records = await rows<{ store: string; id: string; data: string | null; seq: number }>(
    ctx.env,
    'SELECT store, id, data, seq FROM records WHERE family_id = ?1 AND seq > ?2 ORDER BY seq LIMIT ?3',
    family,
    p.body.since,
    PAGE,
  )
  return Response.json({ familyId: family, records, more: records.length === PAGE }, { headers: ctx.headers })
}

/** POST /data/push — upserts (data null = delete). Last write wins. */
const handlePush = async (request: Request, ctx: Ctx) => {
  const p = await parse(request, pushBody, ctx)
  if ('error' in p) return p.error
  const family = await familyOf(ctx.env, p.user)
  if (p.body.changes.length) {
    // seq is taken inside each statement: writes run one at a time, so a later write always gets a higher seq
    // and a device that already pulled up to some seq can't miss it.
    await ctx.env.DB.batch(
      p.body.changes.map((c) =>
        ctx.env.DB.prepare(
          `INSERT INTO records (family_id, store, id, data, seq)
           VALUES (?1, ?2, ?3, ?4, (SELECT COALESCE(MAX(seq), 0) + 1 FROM records WHERE family_id = ?1))
           ON CONFLICT(family_id, store, id) DO UPDATE SET data = excluded.data, seq = excluded.seq`,
        ).bind(family, c.store, c.id, c.data),
      ),
    )
  }
  return Response.json({ familyId: family }, { headers: ctx.headers })
}

/** POST /family — my family's members, invites I've received, and invites my family has sent. */
const handleFamily = async (request: Request, ctx: Ctx) => {
  const p = await parse(request, sessionBody, ctx)
  if ('error' in p) return p.error
  const family = await familyOf(ctx.env, p.user)
  const [members, received, sent] = await Promise.all([
    rows<{ email: string }>(ctx.env, 'SELECT email FROM members WHERE family_id = ?1 ORDER BY email', family),
    rows<{ familyId: string; from: string }>(
      ctx.env,
      'SELECT family_id AS familyId, invited_by AS "from" FROM invites WHERE email = ?1 AND family_id != ?2',
      p.user,
      family,
    ),
    rows<{ email: string }>(ctx.env, 'SELECT email FROM invites WHERE family_id = ?1 ORDER BY email', family),
  ])
  return Response.json(
    {
      me: p.user,
      members: members.map((m) => m.email),
      received,
      sent: sent.map((s) => s.email),
    },
    { headers: ctx.headers },
  )
}

/** POST /family/invite — lets `email` join my family (they accept from their own account). */
const handleInvite = async (request: Request, ctx: Ctx) => {
  const p = await parse(request, inviteBody, ctx)
  if ('error' in p) return p.error
  if (p.body.email === p.user) return Response.json({ error: 'self' }, { status: 400, headers: ctx.headers })
  const family = await familyOf(ctx.env, p.user)
  const already = await rows(ctx.env, 'SELECT 1 FROM members WHERE email = ?1 AND family_id = ?2', p.body.email, family)
  if (already.length) return Response.json({ error: 'member' }, { status: 409, headers: ctx.headers })
  const count = await rows<{ n: number }>(ctx.env, 'SELECT COUNT(*) AS n FROM invites WHERE family_id = ?1', family)
  // Keeps a stolen session from spamming invites.
  if (count[0].n >= 20) return Response.json({ error: 'limit' }, { status: 429, headers: ctx.headers })
  await rows(
    ctx.env,
    'INSERT INTO invites (family_id, email, invited_by, created_at) VALUES (?1, ?2, ?3, ?4) ON CONFLICT DO NOTHING',
    family,
    p.body.email,
    p.user,
    Date.now(),
  )
  return Response.json({ ok: true }, { headers: ctx.headers })
}

/** POST /family/cancel — withdraws an invite my family sent. */
const handleCancelInvite = async (request: Request, ctx: Ctx) => {
  const p = await parse(request, inviteBody, ctx)
  if ('error' in p) return p.error
  const family = await familyOf(ctx.env, p.user)
  await rows(ctx.env, 'DELETE FROM invites WHERE family_id = ?1 AND email = ?2', family, p.body.email)
  return Response.json({ ok: true }, { headers: ctx.headers })
}

/** POST /family/accept — joins the inviting family; my data is merged into theirs. */
const handleAccept = async (request: Request, ctx: Ctx) => {
  const p = await parse(request, acceptBody, ctx)
  if ('error' in p) return p.error
  const invite = await rows(
    ctx.env,
    'SELECT 1 FROM invites WHERE family_id = ?1 AND email = ?2',
    p.body.familyId,
    p.user,
  )
  if (!invite.length) return Response.json({ error: 'no invite' }, { status: 404, headers: ctx.headers })
  const current = await familyOf(ctx.env, p.user)
  await moveUser(ctx.env, p.user, current, p.body.familyId)
  await rows(ctx.env, 'DELETE FROM invites WHERE email = ?1 AND family_id = ?2', p.user, p.body.familyId)
  return Response.json({ familyId: p.body.familyId }, { headers: ctx.headers })
}

/** POST /family/leave — starts my own family again, with a copy of the shared data. */
const handleLeave = async (request: Request, ctx: Ctx) => {
  const p = await parse(request, sessionBody, ctx)
  if ('error' in p) return p.error
  const current = await familyOf(ctx.env, p.user)
  const others = await rows(ctx.env, 'SELECT 1 FROM members WHERE family_id = ?1 AND email != ?2', current, p.user)
  if (!others.length) return Response.json({ familyId: current }, { headers: ctx.headers })
  const next = crypto.randomUUID()
  await moveUser(ctx.env, p.user, current, next)
  return Response.json({ familyId: next }, { headers: ctx.headers })
}

export { handlePull, handlePush, handleFamily, handleInvite, handleCancelInvite, handleAccept, handleLeave, STORES }
export type { DataEnv }
