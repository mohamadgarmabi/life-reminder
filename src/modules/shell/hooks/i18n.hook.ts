import { useSelector } from '@tanstack/react-store'
import { settingsStore } from '#/modules/settings/stores/settings.store'
import { dirOf, t } from '#/modules/shell/utils/i18n'

const useI18n = () => {
  const lang = useSelector(settingsStore, (s) => s.language)
  return { lang, dir: dirOf(lang), t }
}

export { useI18n }
