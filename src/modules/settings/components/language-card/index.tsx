import { Languages } from 'lucide-react'
import { GlassTabs } from '#/components/liquid-glass'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { useLanguageCard } from '#/modules/settings/hooks/language-card.hook'

const LanguageCard = () => {
  const { lang, t, handleChange } = useLanguageCard()

  return (
    <SettingsRow
      icon={Languages}
      tone="bg-emerald-500"
      title={t('settings.language')}
      description={t('settings.languageHint')}
      trailing={
        <GlassTabs
          aria-label={t('settings.language')}
          size="sm"
          className="w-fit!"
          value={lang}
          onValueChange={handleChange}
          options={[
            { value: 'fa', label: 'فارسی', 'aria-label': 'فارسی' },
            { value: 'en', label: 'English', 'aria-label': 'English' },
          ]}
        />
      }
    />
  )
}

export { LanguageCard }
