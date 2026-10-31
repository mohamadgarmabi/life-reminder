import { Moon, Sun } from 'lucide-react'
import { Button } from '#/modules/shell/components/ui/button'
import { Card, CardTitle } from '#/modules/shell/components/ui/card'
import { useThemeCard } from '#/modules/settings/hooks/theme-card.hook'

const ThemeCard = () => {
  const { ariaLabel, sunClassName, moonClassName, handleToggle } = useThemeCard()

  return (
    <Card className="flex-row items-center justify-between px-4">
      <CardTitle>ظاهر</CardTitle>
      <Button variant="secondary" size="icon" onClick={handleToggle} aria-label={ariaLabel}>
        <Sun className={sunClassName} aria-hidden />
        <Moon className={moonClassName} aria-hidden />
      </Button>
    </Card>
  )
}

export { ThemeCard }
