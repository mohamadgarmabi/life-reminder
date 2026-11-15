import { motion } from 'motion/react'
import type { GameIslandProps } from '#/modules/games/types'
import { useGameIsland } from '#/modules/games/hooks/game-island.hook'

const GameIsland = (props: GameIslandProps) => {
  const {
    isExpanded,
    isCompact,
    handleToggle,
    Icon,
    title,
    subtitle,
    value,
    rest,
    hasRest,
    ariaLabel,
    transition,
    pillStyle,
    valueKey,
    valueMotion,
    contentMotion,
    frameClassName,
    pillClassName,
    compactClassName,
    expandedClassName,
    rowClassName,
    iconClassName,
    valueClassName,
    tileClassName,
    tileIconClassName,
    titleStackClassName,
    titleClassName,
    subtitleClassName,
    bigValueClassName,
    restClassName,
  } = useGameIsland(props)

  return (
    <div className={frameClassName}>
      <motion.button
        type="button"
        layout
        transition={transition}
        style={pillStyle}
        className={pillClassName}
        aria-label={ariaLabel}
        aria-expanded={isExpanded}
        onClick={handleToggle}
      >
        {isCompact && (
          <motion.span layout {...contentMotion} className={compactClassName}>
            <Icon aria-hidden className={iconClassName} />
            <motion.span key={valueKey} {...valueMotion} className={valueClassName}>
              {value}
            </motion.span>
          </motion.span>
        )}
        {isExpanded && (
          <motion.span layout {...contentMotion} className={expandedClassName}>
            <span className={rowClassName}>
              <span className={tileClassName}>
                <Icon aria-hidden className={tileIconClassName} />
              </span>
              <span className={titleStackClassName}>
                <span className={titleClassName}>{title}</span>
                <span className={subtitleClassName}>{subtitle}</span>
              </span>
              <motion.span key={valueKey} {...valueMotion} className={bigValueClassName}>
                {value}
              </motion.span>
            </span>
            {hasRest && (
              <span className={restClassName}>
                {rest.map((stat) => (
                  <span key={stat.label}>
                    {stat.label}: {stat.value}
                  </span>
                ))}
              </span>
            )}
          </motion.span>
        )}
      </motion.button>
    </div>
  )
}

export { GameIsland }
