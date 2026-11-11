import { Card } from '#/components/card'
import type { SettingsSectionProps } from '#/modules/settings/types'

// Grouped list: small heading above, rows divided inside one card, optional footnote below.
const SettingsSection = ({ title, description, children }: SettingsSectionProps) => {
  return (
    <section>
      <h2 className="px-4 pb-1.5 text-xs font-medium text-muted-foreground">{title}</h2>
      <Card className="gap-0 divide-y divide-border/60 overflow-hidden py-0">{children}</Card>
      {description && <p className="px-4 pt-1.5 text-xs text-muted-foreground">{description}</p>}
    </section>
  )
}

export { SettingsSection }
