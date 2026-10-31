import { createFileRoute } from '@tanstack/react-router'
import SettingsView from '#/modules/settings/views/settings-view'

const SettingsRoute = () => <SettingsView />

export const Route = createFileRoute('/settings')({
  component: SettingsRoute,
})
