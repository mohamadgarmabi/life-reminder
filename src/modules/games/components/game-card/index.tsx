import { Link } from '@tanstack/react-router'
import { ChevronLeft, type LucideIcon } from 'lucide-react'
import { Card } from '#/components/card'

type GameCardProps = { to: '/games/sudoku' | '/games/match3'; icon: LucideIcon; title: string; description: string }

const GameCard = ({ to, icon: Icon, title, description }: GameCardProps) => {
  return (
    <Link to={to} className="block rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
      <Card className="flex-row items-center gap-3 px-4 transition-transform active:scale-[0.98]">
        <div className="rounded-full bg-secondary p-2.5">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ChevronLeft className="size-5 text-muted-foreground" aria-hidden />
      </Card>
    </Link>
  )
}

export { GameCard }
