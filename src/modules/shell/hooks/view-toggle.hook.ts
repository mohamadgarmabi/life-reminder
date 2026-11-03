import { useSelector } from '@tanstack/react-store'
import { settingsStore, updateSettings } from '#/modules/settings/stores/settings.store'
import type { Settings } from '#/modules/settings/types'

type ViewPage = keyof Settings['views']
type ViewMode = Settings['views'][ViewPage]

/** The page's remembered list/grid layout and a setter. */
const useViewMode = (page: ViewPage) => {
  const view = useSelector(settingsStore, (s) => s.views[page])
  const setView = (next: ViewMode) => updateSettings({ views: { ...settingsStore.state.views, [page]: next } })
  return { view, setView }
}

export { useViewMode }
export type { ViewPage, ViewMode }
