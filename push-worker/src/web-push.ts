// Web Push sender (RFC 8291 aes128gcm payload encryption + RFC 8292 VAPID) on WebCrypto only.

interface PushSub {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

interface Vapid {
  /** Uncompressed P-256 public key, base64url (65 bytes). */
  publicKey: string
  /** Private scalar `d`, base64url. Same format as `npx web-push generate-vapid-keys`. */
  privateKey: string
  /** mailto: or https: contact, required by Apple. */
  subject: string
}

const utf8 = new TextEncoder()

const b64uEncode = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const b64uDecode = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

const concat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let offset = 0
  for (const p of parts) {
    out.set(p, offset)
    offset += p.length
  }
  return out
}

const hkdf = async (salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number) => {
  const key = await crypto.subtle.importKey('raw', ikm as BufferSource, 'HKDF', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: salt as BufferSource, info: info as BufferSource },
    key,
    length * 8,
  )
  return new Uint8Array(bits)
}

const P256 = { name: 'ECDH', namedCurve: 'P-256' } as const

const encrypt = async (payload: string, sub: PushSub) => {
  const uaPublic = b64uDecode(sub.keys.p256dh)
  const ua = await crypto.subtle.importKey('raw', uaPublic as BufferSource, P256, false, [])
  const as = (await crypto.subtle.generateKey(P256, true, ['deriveBits'])) as CryptoKeyPair
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', as.publicKey))
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: ua }, as.privateKey, 256))

  const ikm = await hkdf(
    b64uDecode(sub.keys.auth),
    shared,
    concat(utf8.encode('WebPush: info\0'), uaPublic, asPublic),
    32,
  )
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const cek = await hkdf(salt, ikm, utf8.encode('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdf(salt, ikm, utf8.encode('Content-Encoding: nonce\0'), 12)

  const key = await crypto.subtle.importKey('raw', cek as BufferSource, 'AES-GCM', false, ['encrypt'])
  // Single record: plaintext followed by the 0x02 "last record" delimiter.
  const plain = concat(utf8.encode(payload), new Uint8Array([2]))
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce as BufferSource }, key, plain as BufferSource),
  )

  const header = new Uint8Array(21)
  header.set(salt)
  new DataView(header.buffer).setUint32(16, 4096) // record size
  header[20] = asPublic.length
  return concat(header, asPublic, cipher)
}

const vapidAuthorization = async (endpoint: string, vapid: Vapid) => {
  const pub = b64uDecode(vapid.publicKey)
  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', d: vapid.privateKey, x: b64uEncode(pub.slice(1, 33)), y: b64uEncode(pub.slice(33, 65)) },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  )
  const part = (o: object) => b64uEncode(utf8.encode(JSON.stringify(o)))
  const claims = { aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: vapid.subject }
  const unsigned = `${part({ typ: 'JWT', alg: 'ES256' })}.${part(claims)}`
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, utf8.encode(unsigned))
  return `vapid t=${unsigned}.${b64uEncode(signature)}, k=${vapid.publicKey}`
}

const sendPush = async (sub: PushSub, payload: string, vapid: Vapid) =>
  fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      Authorization: await vapidAuthorization(sub.endpoint, vapid),
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: String(24 * 3600),
      Urgency: 'high',
    },
    body: (await encrypt(payload, sub)) as BufferSource,
  })

export { b64uDecode, b64uEncode, encrypt, hkdf, sendPush, vapidAuthorization }
export type { PushSub, Vapid }
