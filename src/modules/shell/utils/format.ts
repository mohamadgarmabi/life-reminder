import { format as formatGregorian, getMonth, getYear } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { format, getMonth as getJalaliMonth, getYear as getJalaliYear, newDate } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale/fa-IR'
import { daysBetween, parseIsoDate, toIsoDate } from '#/modules/shell/utils/dates'
import { getLanguage, t } from '#/modules/shell/utils/i18n'
import { type IsoDate } from '#/modules/shell/types'

// Display-only helpers. Nothing here is used for date arithmetic or storage.

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

/** Persian digits in Persian, unchanged in English. */
const toLocalDigits = (v: string | number): string =>
  getLanguage() === 'fa' ? String(v).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]) : String(v)

/** Normalise Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII so user input parses. */
const toEnDigits = (s: string): string =>
  s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))

const numberFormats = { fa: new Intl.NumberFormat('fa-IR'), en: new Intl.NumberFormat('en-US') }
const formatNumber = (n: number) => numberFormats[getLanguage()].format(n)

const currencyLabel = (currency: string) =>
  currency === 'IRT' ? t('common.toman') : currency === 'IRR' ? t('common.rial') : currency
const formatMoney = (amount: number, currency = 'IRT') => `${formatNumber(amount)} ${currencyLabel(currency)}`

const toDate = (d: Date | IsoDate) => (typeof d === 'string' ? parseIsoDate(d) : d)
/** Jalali calendar in Persian, Gregorian in English; same date-fns pattern tokens. */
const formatLocal = (d: Date | IsoDate, pattern: string) =>
  getLanguage() === 'fa'
    ? toLocalDigits(format(toDate(d), pattern, { locale: faIR }))
    : formatGregorian(toDate(d), pattern, { locale: enUS })

/** Year and 0-based month in the display calendar (Jalali in Persian, Gregorian in English). */
const localYear = (d: Date | IsoDate) => (getLanguage() === 'fa' ? getJalaliYear : getYear)(toDate(d))
const localMonth = (d: Date | IsoDate) => (getLanguage() === 'fa' ? getJalaliMonth : getMonth)(toDate(d))

/** The 12 month names of the display calendar. */
const monthNames = () =>
  Array.from({ length: 12 }, (_, m) =>
    getLanguage() === 'fa'
      ? format(newDate(1400, m, 1), 'MMMM', { locale: faIR })
      : formatGregorian(new Date(2000, m, 1), 'MMMM', { locale: enUS }),
  )

/**
 * Plans are stored by Jalali year. English shows the Gregorian year it starts in
 * (1405 runs Mar 2026 – Mar 2027 → "2026").
 */
const formatJalaliYear = (jalaliYear: number) =>
  getLanguage() === 'fa' ? toLocalDigits(jalaliYear) : String(jalaliYear + 621)

const PATTERNS = {
  fa: { date: 'yyyy/MM/dd', long: 'EEEE d MMMM yyyy', dayMonth: 'd MMMM' },
  en: { date: 'MMM d, yyyy', long: 'EEEE, MMMM d, yyyy', dayMonth: 'MMM d' },
}

/** ۱۴۰۵/۰۸/۱۰ · Nov 1, 2026 */
const formatDate = (d: Date | IsoDate) => formatLocal(d, PATTERNS[getLanguage()].date)
/** شنبه ۱۰ آبان ۱۴۰۵ · Sunday, November 1, 2026 */
const formatDateLong = (d: Date | IsoDate) => formatLocal(d, PATTERNS[getLanguage()].long)
/** ۱۰ آبان · Nov 1 */
const formatDayMonth = (d: Date | IsoDate) => formatLocal(d, PATTERNS[getLanguage()].dayMonth)
/** ۰۹:۳۰ */
const formatTime = (d: Date) => formatLocal(d, 'HH:mm')
const formatDateTime = (d: Date) => t('common.at', { date: formatDate(d), time: formatTime(d) })

const relativeDay = (d: Date | IsoDate, now: Date = new Date()): string => {
  const diff = daysBetween(toIsoDate(now), typeof d === 'string' ? d : toIsoDate(d))
  if (diff === 0) return t('common.today')
  if (diff === 1) return t('common.tomorrow')
  if (diff === -1) return t('common.yesterday')
  return diff > 0 ? t('common.inDays', { n: toLocalDigits(diff) }) : t('common.daysAgo', { n: toLocalDigits(-diff) })
}

export {
  formatLocal,
  formatJalaliYear,
  localMonth,
  localYear,
  monthNames,
  toLocalDigits,
  toEnDigits,
  formatNumber,
  formatMoney,
  formatDate,
  formatDateLong,
  formatDayMonth,
  formatTime,
  formatDateTime,
  relativeDay,
}
