import { GlassLayer } from '#/components/glass'
import { Link } from '@tanstack/react-router'
import type { GameEntry } from '#/modules/games/types'
import { cn } from '#/modules/shell/utils/cn'

// Phones and tablets get real fullscreen (hides the browser bars); the tap is the required user gesture.
// Desktop keeps the window as is and can use the HUD's fullscreen button.
const enterFullscreen = () => {
  if (!document.fullscreenEnabled || document.fullscreenElement || !matchMedia('(pointer: coarse)').matches) return
  void document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {})
}

const GameCard = ({ game }: { game: GameEntry }) => {
  return (
    <Link
      to="/games/$gameId"
      params={{ gameId: game.id }}
      onClick={enterFullscreen}
      className="relative isolate flex flex-col gap-2 rounded-2xl p-3 transition-transform outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.97]"
    >
      <GlassLayer radius={16} />
      <span className={cn('flex size-11 items-center justify-center rounded-xl text-2xl', game.tint)} aria-hidden>
        {game.emoji}
      </span>
      <span className="font-semibold">{game.title}</span>
      <span className="line-clamp-2 text-xs text-muted-foreground">{game.description}</span>
    </Link>
  )
}

export { GameCard, enterFullscreen }
