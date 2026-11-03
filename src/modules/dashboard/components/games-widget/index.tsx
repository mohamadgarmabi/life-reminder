import { Link } from '@tanstack/react-router'
import { ChevronLeft, Gamepad2 } from 'lucide-react'
import type { WidgetSize } from '#/modules/dashboard/types'
import { enterFullscreen } from '#/modules/games/components/game-card'
import { GAMES } from '#/modules/games/utils/catalog'
import { cn } from '#/modules/shell/utils/cn'

const TILE = 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 transition-transform'

/** Large: every game in a sideways-scrolling row; small: the first four; mini: a shortcut to the games page. */
const GamesWidget = ({ size }: { size: WidgetSize }) => {
  if (size === 'mini') {
    return (
      <Link
        to="/games"
        className={cn(
          '-m-2.5 flex flex-1 flex-col items-center justify-center gap-1 rounded-3xl text-[11px] font-medium',
          TILE,
        )}
      >
        <Gamepad2 className="size-6" aria-hidden />
        بازی‌ها
      </Link>
    )
  }

  const games = size === 'small' ? GAMES.slice(0, 4) : GAMES
  return (
    <>
      <Link to="/games" className={cn('mb-2 flex items-center gap-2 rounded-lg', TILE)}>
        <Gamepad2 className="size-4" aria-hidden />
        <span className="flex-1 text-sm font-semibold">بازی‌ها</span>
        <ChevronLeft className="size-4 text-muted-foreground" aria-hidden />
      </Link>
      <ul
        className={cn(
          size === 'small'
            ? 'grid flex-1 grid-cols-2 gap-2'
            : '-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]',
        )}
      >
        {games.map((game) => (
          <li key={game.id} className={cn(size === 'large' && 'shrink-0 snap-start')}>
            <Link
              to="/games/$gameId"
              params={{ gameId: game.id }}
              onClick={enterFullscreen}
              aria-label={game.title}
              className={cn('flex h-full flex-col items-center justify-center gap-1 rounded-2xl', TILE)}
            >
              <span
                className={cn(
                  'flex items-center justify-center rounded-2xl',
                  size === 'large' ? 'size-14 text-3xl' : 'size-full min-h-10 text-2xl',
                  game.tint,
                )}
                aria-hidden
              >
                {game.emoji}
              </span>
              {size === 'large' && (
                <span className="w-16 truncate text-center text-[11px] font-medium">{game.title}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export { GamesWidget }
