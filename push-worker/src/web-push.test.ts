// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { b64uDecode, b64uEncode, encrypt, hkdf, vapidAuthorization } from './web-push'

const P256 = { name: 'ECDH', namedCurve: 'P-256' } as const
const utf8 = new TextEncoder()

describe('web push', () => {
  it('encrypts a payload the browser can decrypt (RFC 8291)', async () => {
    const ua = (await crypto.subtle.generateKey(P256, true, ['deriveBits'])) as CryptoKeyPair
    const uaPublic = new Uint8Array(await crypto.subtle.exportKey('raw', ua.publicKey))
    const auth = crypto.getRandomValues(new Uint8Array(16))
    const body = await encrypt('{"title":"سلام"}', {
      endpoint: 'https://push.example/x',
      keys: { p256dh: b64uEncode(uaPublic), auth: b64uEncode(auth) },
    })

    // Receiver side
    const salt = body.slice(0, 16)
    const asPublic = body.slice(21, 21 + body[20])
    const as = await crypto.subtle.importKey('raw', asPublic, P256, false, [])
    const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: as }, ua.privateKey, 256))
    const info = new Uint8Array([...utf8.encode('WebPush: info\0'), ...uaPublic, ...asPublic])
    const ikm = await hkdf(auth, shared, info, 32)
    const cek = await hkdf(salt, ikm, utf8.encode('Content-Encoding: aes128gcm\0'), 16)
    const nonce = await hkdf(salt, ikm, utf8.encode('Content-Encoding: nonce\0'), 12)
    const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt'])
    const plain = new Uint8Array(
      await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, key, body.slice(21 + body[20])),
    )
    expect(plain.at(-1)).toBe(2)
    expect(new TextDecoder().decode(plain.slice(0, -1))).toBe('{"title":"سلام"}')
  })

  it('signs a VAPID JWT that verifies with the public key', async () => {
    const pair = (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
      'sign',
      'verify',
    ])) as CryptoKeyPair
    const publicKey = b64uEncode(await crypto.subtle.exportKey('raw', pair.publicKey))
    const { d } = await crypto.subtle.exportKey('jwk', pair.privateKey)
    const header = await vapidAuthorization('https://web.push.apple.com/abc', {
      publicKey,
      privateKey: d!,
      subject: 'mailto:test@example.com',
    })
    const [, jwt, k] = /^vapid t=(.+), k=(.+)$/.exec(header)!
    expect(k).toBe(publicKey)
    const [h, c, s] = jwt.split('.')
    expect(JSON.parse(new TextDecoder().decode(b64uDecode(c))).aud).toBe('https://web.push.apple.com')
    const ok = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      pair.publicKey,
      b64uDecode(s),
      utf8.encode(`${h}.${c}`),
    )
    expect(ok).toBe(true)
  })
})
