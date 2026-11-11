import { Layers } from 'lucide-react'
import { Switch } from '#/components/switch'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { useTransitionsCard } from '#/modules/settings/hooks/transitions-card.hook'

const TransitionsCard = () => {
  const { enabled, handleChange } = useTransitionsCard()

  return (
    <SettingsRow
      icon={Layers}
      tone="bg-sky-500"
      title="انیمیشن جابه‌جایی صفحه‌ها"
      htmlFor="page-transitions"
      trailing={<Switch id="page-transitions" checked={enabled} onCheckedChange={handleChange} />}
    />
  )
}

export { TransitionsCard }
