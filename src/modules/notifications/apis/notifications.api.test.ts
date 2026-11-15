// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { showNotification, syncBadge } from '#/modules/notifications/apis/notifications.api'

const tray: string[] = []
const setAppBadge = vi.fn(async (_n?: number) => {})
const clearAppBadge = vi.fn(async () => {})
const registration = {
  showNotification: async (_title: string, opts: NotificationOptions) => {
    // Same tag replaces, like a real tray.
    if (!tray.includes(opts.tag ?? '')) tray.push(opts.tag ?? '')
  },
  getNotifications: async () => tray.map((tag) => ({ tag })),
}
Object.assign(navigator, {
  serviceWorker: { getRegistration: async () => registration },
  setAppBadge,
  clearAppBadge,
})

const note = (tag: string) => ({ title: 't', body: 'b', tag, path: '/' })

describe('app badge', () => {
  afterEach(() => {
    tray.length = 0
    vi.clearAllMocks()
  })

  it('counts notifications in the tray', async () => {
    await showNotification(note('a'))
    await showNotification(note('b'))
    await showNotification(note('b'))
    expect(setAppBadge).toHaveBeenLastCalledWith(2)
  })

  it('clears when the tray is empty', async () => {
    await syncBadge()
    expect(clearAppBadge).toHaveBeenCalled()
    expect(setAppBadge).not.toHaveBeenCalled()
  })

  it("doesn't fail showing when the badge call rejects", async () => {
    setAppBadge.mockRejectedValueOnce(new Error('denied'))
    await expect(showNotification(note('a'))).resolves.toBeUndefined()
  })
})
