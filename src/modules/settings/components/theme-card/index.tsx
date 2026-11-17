import { Moon, Palette, Sun } from 'lucide-react'
import { Button } from '#/components/button'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { useThemeCard } from '#/modules/settings/hooks/theme-card.hook'

const ThemeCard = () => {
  const { t, ariaLabel, sunClassName, moonClassName, handleToggle } = useThemeCard()

  return (
    <SettingsRow
      icon={Palette}
      tone="bg-indigo-500"
      title={t('settings.theme')}
      description={t('settings.themeHint')}
      trailing={
        <Button variant="secondary" size="icon" onClick={handleToggle} aria-label={ariaLabel}>
          <Sun className={sunClassName} aria-hidden />
          <Moon className={moonClassName} aria-hidden />
        </Button>
      }
    />
  )
}

export { ThemeCard }
