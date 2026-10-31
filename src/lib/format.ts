import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale/fa-IR'
import { daysBetween, parseIsoDate, toIsoDate, type IsoDate } from './dates'

// Display-only helpers. Nothing here is used for date arithmetic or storage.

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

export const toFaDigits = (v: string | number): string =>
  String(v).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)])

/** Normalise Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII so user input parses. */
export const toEnDigits = (s: string): string =>
  s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))

const numberFormat = new Intl.NumberFormat('fa-IR')
export const formatNumber = (n: number) => numberFormat.format(n)

const CURRENCY_LABEL: Record<string, string> = { IRT: 'تومان', IRR: 'ریال' }
export const formatMoney = (amount: number, currency = 'IRT') =>
  `${formatNumber(amount)} ${CURRENCY_LABEL[currency] ?? currency}`

const toDate = (d: Date | IsoDate) => (typeof d === 'string' ? parseIsoDate(d) : d)
const jalali = (d: Date | IsoDate, pattern: string) =>
  toFaDigits(format(toDate(d), pattern, { locale: faIR }))

/** ۱۴۰۵/۰۸/۱۰ */
export const formatDate = (d: Date | IsoDate) => jalali(d, 'yyyy/MM/dd')
/** شنبه ۱۰ آبان ۱۴۰۵ */
export const formatDateLong = (d: Date | IsoDate) => jalali(d, 'EEEE d MMMM yyyy')
/** ۱۰ آبان */
export const formatDayMonth = (d: Date | IsoDate) => jalali(d, 'd MMMM')
/** ۰۹:۳۰ */
export const formatTime = (d: Date) => jalali(d, 'HH:mm')
export const formatDateTime = (d: Date) => `${formatDate(d)} ساعت ${formatTime(d)}`

/** امروز / فردا / دیروز / ۳ روز دیگر / ۵ روز پیش */
export function relativeDay(d: Date | IsoDate, now: Date = new Date()): string {
  const diff = daysBetween(toIsoDate(now), typeof d === 'string' ? d : toIsoDate(d))
  if (diff === 0) return 'امروز'
  if (diff === 1) return 'فردا'
  if (diff === -1) return 'دیروز'
  return diff > 0 ? `${toFaDigits(diff)} روز دیگر` : `${toFaDigits(-diff)} روز پیش`
}

