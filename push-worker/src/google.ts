// Google Calendar sync: one-time OAuth sign-in, then the worker refreshes tokens and reads events on its own.
// The app only holds a random session id; its hash keys the stored refresh token.
import { z } from 'zod'
import { sha256Hex } from './hash'

interface D1Statement {
  bind: (...values: unknown[]) => D1Statement
  all: <T>() => Promise<{ results: T[] }>
}

interface GoogleEnv {
  DB: { prepare: (sql: string) => D1Statement }
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
}

type TokenRow = {
  refresh_token: string
  access_token: string
  expires_at: number
  name: string | null
  email: string | null
  picture: string | null
}

// Sign-in (who the user is) + read-only calendar access, granted together on one consent screen.
const SCOPE = 'openid email profile https://www.googleapis.com/auth/calendar.readonly'
const session = z.string().regex(/^[a-f0-9]{64}$/)
/** Selected calendars read per request; keeps one request well under the Workers subrequest limit. */
const MAX_CALENDARS = 10

const profileSchema = z.object({
  name: z.string().catch(''),
  email: z.string().catch(''),
  picture: z.string().startsWith('https://').catch(''),
})

/** The id_token comes straight from Google's token endpoint over TLS, so its payload is read without verifying. */
const profileFromIdToken = (idToken: string | undefined) => {
  const payload = idToken?.split('.')[1]
  try {
    const json = payload ? atob(payload.replace(/-/g, '+').replace(/_/g, '/')) : '{}'
    return profileSchema.parse(JSON.parse(new TextDecoder().decode(Uint8Array.from(json, (c) => c.charCodeAt(0)))))
  } catch {
    return profileSchema.parse({})
  }
}

const redirectUri = (request: Request) => `${new URL(request.url).origin}/google/callback`

/** Tiny standalone page shown in the sign-in tab; it closes itself after a success. */
const page = (title: string, body: string, ok: boolean) =>
  new Response(
    `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;text-align:center;font-family:system-ui,sans-serif;background:#f2f2f7;color:#000;padding:24px">
<div><p style="font-size:3rem;margin:0">${ok ? '✓' : '✕'}</p><h1 style="font-size:1.25rem">${title}</h1><p style="color:#6e6e73">${body}</p></div>
${ok ? '<script>setTimeout(() => window.close(), 1500)</script>' : ''}</body></html>`,
    { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )

const tokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  id_token: z.string().optional(),
})

/** revoked: Google rejected the grant (user removed access), so the stored token is useless. */
const tokenRequest = async (env: GoogleEnv, params: Record<string, string>) => {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID ?? '',
      client_secret: env.GOOGLE_CLIENT_SECRET ?? '',
      ...params,
    }),
  }).catch(() => null)
  if (!res?.ok) return { ok: false as const, revoked: res?.status === 400 || res?.status === 401 }
  const token = tokenSchema.safeParse(await res.json().catch(() => null))
  return token.success ? { ok: true as const, token: token.data } : { ok: false as const, revoked: false }
}

const findRow = async (env: GoogleEnv, hash: string) =>
  (
    await env.DB.prepare(
      'SELECT refresh_token, access_token, expires_at, name, email, picture FROM google_tokens WHERE session_hash = ?1',
    )
      .bind(hash)
      .all<TokenRow>()
  ).results[0]

const deleteRow = (env: GoogleEnv, hash: string) =>
  env.DB.prepare('DELETE FROM google_tokens WHERE session_hash = ?1').bind(hash).all()

/** GET /google/auth?session=… — the app opens this; it forwards to Google's account picker. */
const handleGoogleAuth = (request: Request, env: GoogleEnv) => {
  const id = session.safeParse(new URL(request.url).searchParams.get('session'))
  if (!id.success || !env.GOOGLE_CLIENT_ID) return page('درخواست نامعتبر', 'دوباره از داخل برنامه تلاش کنید.', false)
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(request),
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    // Always ask, so Google returns a refresh token even for a returning account.
    prompt: 'consent select_account',
    state: id.data,
  }).toString()
  return Response.redirect(url.toString(), 302)
}

/** GET /google/callback — Google sends the user back here; the code becomes a stored refresh token. */
const handleGoogleCallback = async (request: Request, env: GoogleEnv) => {
  const params = new URL(request.url).searchParams
  const id = session.safeParse(params.get('state'))
  const code = params.get('code')
  if (!id.success || !code) return page('ورود انجام نشد', 'دوباره از داخل برنامه تلاش کنید.', false)
  const result = await tokenRequest(env, { code, redirect_uri: redirectUri(request), grant_type: 'authorization_code' })
  if (!result.ok || !result.token.refresh_token)
    return page('ورود انجام نشد', 'دوباره از داخل برنامه تلاش کنید.', false)
  const { access_token, expires_in, refresh_token, id_token } = result.token
  const profile = profileFromIdToken(id_token)
  await env.DB.prepare(
    `INSERT INTO google_tokens (session_hash, refresh_token, access_token, expires_at, name, email, picture)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
     ON CONFLICT(session_hash) DO UPDATE SET refresh_token = excluded.refresh_token,
       access_token = excluded.access_token, expires_at = excluded.expires_at,
       name = excluded.name, email = excluded.email, picture = excluded.picture`,
  )
    .bind(
      await sha256Hex(id.data),
      refresh_token,
      access_token,
      Date.now() + expires_in * 1000,
      profile.name,
      profile.email,
      profile.picture,
    )
    .all()
  return page('با حساب گوگل وارد شدید', 'به برنامه برگردید؛ تقویم گوگل خودکار همگام می‌شود.', true)
}

/** POST /google/account — who is signed in; the app polls it while the sign-in tab is open. */
const handleGoogleAccount = async (request: Request, env: GoogleEnv, headers: Record<string, string>) => {
  const body = z.object({ session }).safeParse(await request.json().catch(() => null))
  if (!body.success) return new Response('invalid body', { status: 400, headers })
  const row = await findRow(env, await sha256Hex(body.data.session))
  if (!row) return Response.json({ connected: false }, { headers })
  return Response.json(
    { connected: true, account: { name: row.name ?? '', email: row.email ?? '', picture: row.picture ?? '' } },
    { headers },
  )
}

const eventsBody = z.object({ session, timeMin: z.iso.datetime(), timeMax: z.iso.datetime() })

const calendarListSchema = z.object({
  items: z.array(z.object({ id: z.string(), selected: z.boolean().optional() })).catch([]),
})

const when = z.object({ dateTime: z.string().optional(), date: z.string().optional() })
const eventsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        summary: z.string().optional(),
        status: z.string().optional(),
        start: when,
        end: when,
      }),
    )
    .catch([]),
})

/** POST /google/events — instances (recurrences already expanded by Google) of every selected calendar. */
const handleGoogleEvents = async (request: Request, env: GoogleEnv, headers: Record<string, string>) => {
  const body = eventsBody.safeParse(await request.json().catch(() => null))
  if (!body.success) return new Response('invalid body', { status: 400, headers })
  const hash = await sha256Hex(body.data.session)
  const row = await findRow(env, hash)
  // Not signed in yet (the app polls this while the sign-in tab is open) or signed out.
  if (!row) return Response.json({ connected: false }, { headers })

  let access = row.access_token
  if (row.expires_at < Date.now() + 60_000) {
    const result = await tokenRequest(env, { refresh_token: row.refresh_token, grant_type: 'refresh_token' })
    if (!result.ok) {
      if (!result.revoked) return new Response('google unavailable', { status: 502, headers })
      await deleteRow(env, hash)
      return Response.json({ connected: false }, { headers })
    }
    access = result.token.access_token
    await env.DB.prepare('UPDATE google_tokens SET access_token = ?1, expires_at = ?2 WHERE session_hash = ?3')
      .bind(access, Date.now() + result.token.expires_in * 1000, hash)
      .all()
  }

  const api = (path: string, params: Record<string, string>) =>
    fetch(`https://www.googleapis.com/calendar/v3${path}?${new URLSearchParams(params)}`, {
      headers: { Authorization: `Bearer ${access}` },
    })
  const listRes = await api('/users/me/calendarList', { minAccessRole: 'reader', fields: 'items(id,selected)' })
  if (listRes.status === 401) {
    await deleteRow(env, hash)
    return Response.json({ connected: false }, { headers })
  }
  if (!listRes.ok) return new Response('google unavailable', { status: 502, headers })
  const calendars = calendarListSchema
    .parse(await listRes.json())
    .items.filter((c) => c.selected !== false)
    .slice(0, MAX_CALENDARS)

  const perCalendar = await Promise.all(
    calendars.map(async (c) => {
      const res = await api(`/calendars/${encodeURIComponent(c.id)}/events`, {
        singleEvents: 'true',
        orderBy: 'startTime',
        timeMin: body.data.timeMin,
        timeMax: body.data.timeMax,
        maxResults: '2500',
        fields: 'items(id,summary,status,start,end)',
      }).catch(() => null)
      if (!res?.ok) return []
      return eventsSchema
        .parse(await res.json())
        .items.filter((e) => e.status !== 'cancelled' && (e.start.dateTime || e.start.date))
        .map((e) => ({
          id: `${c.id}:${e.id}`,
          title: e.summary || 'بدون عنوان',
          start: e.start.dateTime ?? e.start.date,
          end: e.end.dateTime ?? e.end.date ?? e.start.dateTime ?? e.start.date,
          allDay: !e.start.dateTime,
        }))
    }),
  )
  return Response.json({ connected: true, events: perCalendar.flat() }, { headers })
}

/** POST /google/disconnect — revokes Google's grant and forgets the token. */
const handleGoogleDisconnect = async (request: Request, env: GoogleEnv, headers: Record<string, string>) => {
  const body = z.object({ session }).safeParse(await request.json().catch(() => null))
  if (!body.success) return new Response('invalid body', { status: 400, headers })
  const hash = await sha256Hex(body.data.session)
  const row = await findRow(env, hash)
  if (row)
    await fetch(`https://oauth2.googleapis.com/revoke?${new URLSearchParams({ token: row.refresh_token })}`, {
      method: 'POST',
    }).catch(() => null)
  await deleteRow(env, hash)
  return new Response(null, { status: 204, headers })
}

export {
  handleGoogleAuth,
  handleGoogleCallback,
  handleGoogleAccount,
  handleGoogleEvents,
  handleGoogleDisconnect,
  profileFromIdToken,
}
