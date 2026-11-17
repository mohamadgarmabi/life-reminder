import { describe, expect, it } from 'vitest'
import { dirOf, translate } from '#/modules/shell/utils/i18n'

describe('i18n', () => {
  it('translates and interpolates', () => {
    expect(translate('en', 'nav.home')).toBe('Home')
    expect(translate('fa', 'nav.home')).toBe('خانه')
    expect(translate('en', 'settings.footer', { version: '2' })).toContain('v2')
  })
  it('maps language to direction', () => {
    expect(dirOf('fa')).toBe('rtl')
    expect(dirOf('en')).toBe('ltr')
  })
})
