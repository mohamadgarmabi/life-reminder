import { updateSettings } from '#/modules/settings/stores/settings.store'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'
import type { Language } from '#/modules/shell/utils/i18n'

const useLanguageCard = () => {
  const { lang, t } = useI18n()

  const handleChange = (value: string) => updateSettings({ language: value as Language })

  return { lang, t, handleChange }
}

export { useLanguageCard }
