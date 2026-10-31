import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatDateLong,
  formatMoney,
  relativeDay,
  toEnDigits,
  toFaDigits,
} from '#/modules/shell/utils/format'

describe('format', () => {
  it('converts digits both ways', () => {
    expect(toFaDigits('2026/10')).toBe('۲۰۲۶/۱۰')
    expect(toEnDigits('۱۲۳٤٥')).toBe('12345')
  })

  it('formats Jalali dates with Persian digits', () => {
    expect(formatDate('2026-11-01')).toBe('۱۴۰۵/۰۸/۱۰')
    expect(formatDate('2025-03-21')).toBe('۱۴۰۴/۰۱/۰۱') // Nowruz
    expect(formatDateLong('2026-11-01')).toBe('یک\u200cشنبه ۱۰ آبان ۱۴۰۵')
  })

  it('formats money with Persian grouping', () => {
    expect(formatMoney(1250000)).toBe('۱٬۲۵۰٬۰۰۰ تومان')
  })

  it('labels relative days', () => {
    const now = new Date(2026, 9, 31, 22, 0)
    expect(relativeDay('2026-10-31', now)).toBe('امروز')
    expect(relativeDay('2026-11-01', now)).toBe('فردا')
    expect(relativeDay('2026-10-30', now)).toBe('دیروز')
    expect(relativeDay('2026-11-03', now)).toBe('۳ روز دیگر')
  })
})
