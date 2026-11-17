import { Languages } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '#/components/tabs'
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
        <Tabs value={lang} onValueChange={handleChange}>
          <TabsList aria-label={t('settings.language')}>
            <TabsTrigger value="fa" lang="fa">
              فارسی
            </TabsTrigger>
            <TabsTrigger value="en" lang="en">
              English
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }
    />
  )
}

export { LanguageCard }
