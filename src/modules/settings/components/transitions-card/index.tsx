import { Card } from '#/components/card'
import { Label } from '#/components/label'
import { Switch } from '#/components/switch'
import { useTransitionsCard } from '#/modules/settings/hooks/transitions-card.hook'

const TransitionsCard = () => {
  const { enabled, handleChange } = useTransitionsCard()

  return (
    <Card className="flex-row items-center justify-between px-4">
      <Label htmlFor="page-transitions" className="font-semibold">
        انیمیشن جابه‌جایی صفحه‌ها
      </Label>
      <Switch id="page-transitions" checked={enabled} onCheckedChange={handleChange} />
    </Card>
  )
}

export { TransitionsCard }
