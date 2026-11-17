import { Layers } from 'lucide-react'
import { Switch } from '#/components/switch'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { useTransitionsCard } from '#/modules/settings/hooks/transitions-card.hook'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'

const TransitionsCard = () => {
  const { enabled, handleChange } = useTransitionsCard()
  const { t } = useI18n()

  return (
    <SettingsRow
      icon={Layers}
      tone="bg-sky-500"
      title={t('settings.transitions')}
      htmlFor="page-transitions"
      trailing={<Switch id="page-transitions" checked={enabled} onCheckedChange={handleChange} />}
    />
  )
}

export { TransitionsCard }
