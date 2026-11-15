import { useSelector } from '@tanstack/react-store'
import { settingsStore } from '#/modules/settings/stores/settings.store'

const useToaster = () => {
  const theme = useSelector(settingsStore, (s) => s.theme)
  return { theme }
}

export { useToaster }
