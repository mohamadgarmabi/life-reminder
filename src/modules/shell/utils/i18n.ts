import { settingsStore } from '#/modules/settings/stores/settings.store'
import shell from '#/modules/shell/utils/shell.messages'
import settings from '#/modules/settings/utils/settings.messages'
import dashboard from '#/modules/dashboard/utils/dashboard.messages'
import account from '#/modules/account/utils/account.messages'
import database from '#/modules/database/utils/database.messages'
import notifications from '#/modules/notifications/utils/notifications.messages'
import installments from '#/modules/installments/utils/installments.messages'
import plans from '#/modules/plans/utils/plans.messages'
import plants from '#/modules/plants/utils/plants.messages'
import reminders from '#/modules/reminders/utils/reminders.messages'
import games from '#/modules/games/utils/games.messages'
import adventure from '#/modules/games/adventure/utils/adventure.messages'

type Language = 'fa' | 'en'

// Each module owns its strings in utils/<module>.messages.ts; they are merged here.
const fa = {
  ...shell.fa,
  ...settings.fa,
  ...dashboard.fa,
  ...account.fa,
  ...database.fa,
  ...notifications.fa,
  ...installments.fa,
  ...plans.fa,
  ...plants.fa,
  ...reminders.fa,
  ...games.fa,
  ...adventure.fa,
}

type MessageKey = keyof typeof fa

const MESSAGES: Record<Language, Record<MessageKey, string>> = {
  fa,
  en: {
    ...shell.en,
    ...settings.en,
    ...dashboard.en,
    ...account.en,
    ...database.en,
    ...notifications.en,
    ...installments.en,
    ...plans.en,
    ...plants.en,
    ...reminders.en,
    ...games.en,
    ...adventure.en,
  },
}

const dirOf = (lang: Language): 'rtl' | 'ltr' => (lang === 'fa' ? 'rtl' : 'ltr')

const translate = (lang: Language, key: MessageKey, vars: Record<string, string | number> = {}) =>
  MESSAGES[lang][key].replace(/\{(\w+)\}/g, (m, name: string) => String(vars[name] ?? m))

const getLanguage = (): Language => settingsStore.state.language

/**
 * Translates in the current language. Safe outside React: the app subtree remounts on a language change
 * (see RootDocument), so call it at render/call time, never in module-level constants.
 */
const t = (key: MessageKey, vars?: Record<string, string | number>) => translate(getLanguage(), key, vars)

export { dirOf, getLanguage, t, translate }
export type { Language, MessageKey }
