import { Gamepad2 } from 'lucide-react'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'

const GamesCard = () => {
  const { t } = useI18n()
  return <SettingsRow icon={Gamepad2} tone="bg-pink-500" title={t('settings.games')} to="/games" />
}

export { GamesCard }
