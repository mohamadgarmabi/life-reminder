import { describe, expect, it } from 'vitest'
import { profileFromIdToken } from './google'

const b64url = (obj: object) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

describe('profileFromIdToken', () => {
  it('reads a UTF-8 (Persian) name from a base64url payload', () => {
    const token = `h.${b64url({ name: 'محمد گرمابی', email: 'A@b.c', email_verified: true, picture: 'https://x/y.png' })}.s`
    expect(profileFromIdToken(token)).toEqual({ name: 'محمد گرمابی', email: 'a@b.c', picture: 'https://x/y.png' })
  })

  it('drops an unverified email, since it is the identity for sync and invites', () => {
    expect(profileFromIdToken(`h.${b64url({ email: 'a@b.c', email_verified: false })}.s`).email).toBe('')
    expect(profileFromIdToken(`h.${b64url({ email: 'a@b.c' })}.s`).email).toBe('')
  })

  it('falls back to empty fields for a missing or broken token and drops non-https pictures', () => {
    expect(profileFromIdToken(undefined)).toEqual({ name: '', email: '', picture: '' })
    expect(profileFromIdToken('h.%%%.s')).toEqual({ name: '', email: '', picture: '' })
    expect(profileFromIdToken(`h.${b64url({ picture: 'javascript:alert(1)' })}.s`).picture).toBe('')
  })
})
