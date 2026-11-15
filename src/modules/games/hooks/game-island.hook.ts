import { Pause, Star } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { useState } from 'react'
import type { GameIslandProps } from '#/modules/games/types'
import {
  gameIslandBigValueStyles,
  gameIslandCompactStyles,
  gameIslandExpandedStyles,
  gameIslandFrameStyles,
  gameIslandIconStyles,
  gameIslandPillStyles,
  gameIslandRestStyles,
  gameIslandRowStyles,
  gameIslandSubtitleStyles,
  gameIslandTileIconStyles,
  gameIslandTileStyles,
  gameIslandTitleStackStyles,
  gameIslandTitleStyles,
  gameIslandValueStyles,
} from '#/modules/games/utils/game-island.styles'

const SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const
const INSTANT = { duration: 0 } as const
/** Set through `style`, not a class, so motion's layout animation keeps the corners round while the pill morphs. */
const RADIUS = { compact: 18, expanded: 32 } as const

/**
 * The game's Dynamic Island: the first stat (the live score) rides in a black pill at the top of the
 * play area; a tap opens the rest. Values arrive formatted by the views (`toFaDigits`), so they stay
 * Persian. In RTL the first flex child sits on the right, so the glyph leads as a Persian reader expects.
 */
const useGameIsland = ({ title, stats, overlay }: GameIslandProps) => {
  const [expanded, setExpanded] = useState(false)
  const reduced = useReducedMotion()
  const paused = Boolean(overlay)
  const [primary, ...rest] = stats
  const transition = reduced ? INSTANT : SPRING

  return {
    isExpanded: expanded,
    isCompact: !expanded,
    handleToggle: () => setExpanded((open) => !open),
    Icon: paused ? Pause : Star,
    title,
    subtitle: paused ? 'مکث' : primary?.label,
    value: primary?.value,
    rest,
    hasRest: rest.length > 0,
    ariaLabel: `${title}، ${primary?.label ?? ''}: ${String(primary?.value ?? '')}`,
    transition,
    pillStyle: { borderRadius: expanded ? RADIUS.expanded : RADIUS.compact },
    // A new score slides up into place; the key restarts the animation on each change.
    valueKey: String(primary?.value ?? ''),
    valueMotion: { initial: reduced ? false : { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition },
    // Content fades in once the pill has mostly reached its new size, so the morph never squashes text.
    contentMotion: {
      initial: reduced ? false : { opacity: 0 },
      animate: { opacity: 1 },
      transition: reduced ? INSTANT : { duration: 0.18, delay: 0.08 },
    },
    frameClassName: gameIslandFrameStyles(),
    pillClassName: gameIslandPillStyles({ expanded }),
    compactClassName: gameIslandCompactStyles(),
    expandedClassName: gameIslandExpandedStyles(),
    rowClassName: gameIslandRowStyles(),
    iconClassName: gameIslandIconStyles({ paused }),
    valueClassName: gameIslandValueStyles({ paused }),
    tileClassName: gameIslandTileStyles({ paused }),
    tileIconClassName: gameIslandTileIconStyles(),
    titleStackClassName: gameIslandTitleStackStyles(),
    titleClassName: gameIslandTitleStyles(),
    subtitleClassName: gameIslandSubtitleStyles(),
    bigValueClassName: gameIslandBigValueStyles({ paused }),
    restClassName: gameIslandRestStyles(),
  }
}

export { useGameIsland }
