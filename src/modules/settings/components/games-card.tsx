import { Link } from '@tanstack/react-router'
import { ChevronLeft, Gamepad2 } from 'lucide-react'
import { Card, CardTitle } from '#/modules/shell/components/ui/card'

const GamesCard = () => {
  return (
    <Link to="/games" className="block rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
      <Card className="flex-row items-center gap-3 px-4 transition-transform active:scale-[0.98]">
        <Gamepad2 className="size-5" aria-hidden />
        <CardTitle className="flex-1">بازی‌ها</CardTitle>
        <ChevronLeft className="size-5 text-muted-foreground" aria-hidden />
      </Card>
    </Link>
  )
}

export { GamesCard }
