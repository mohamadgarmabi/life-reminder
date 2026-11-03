import { useSelector } from '@tanstack/react-store'
import { settingsStore, updateSettings } from '#/modules/settings/stores/settings.store'

const useTransitionsCard = () => ({
  enabled: useSelector(settingsStore, (s) => s.pageTransitions),
  handleChange: (pageTransitions: boolean) => updateSettings({ pageTransitions }),
})

export { useTransitionsCard }
