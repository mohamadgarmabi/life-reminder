import { Gamepad2 } from 'lucide-react'
import { SettingsRow } from '#/modules/settings/components/settings-row'

const GamesCard = () => {
  return <SettingsRow icon={Gamepad2} tone="bg-pink-500" title="بازی‌ها" to="/games" />
}

export { GamesCard }
