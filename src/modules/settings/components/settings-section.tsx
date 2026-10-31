import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/card'
import type { SettingsSectionProps } from '#/modules/settings/types'

const SettingsSection = ({ title, description, children }: SettingsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

export { SettingsSection }
