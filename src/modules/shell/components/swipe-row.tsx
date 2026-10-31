import { motion } from 'motion/react'
import { useSwipeRow } from '#/modules/shell/hooks/swipe-row.hook'
import {
  swipeRowActionLabelStyles,
  swipeRowActionStyles,
  swipeRowPrimaryBlockStyles,
  swipeRowPrimaryButtonStyles,
  swipeRowRailStyles,
  swipeRowShellStyles,
  swipeRowSurfaceStyles,
  swipeRowToggleStyles,
} from '#/modules/shell/utils/swipe-row.styles'
import type { SwipeRowProps } from '#/modules/shell/types/swipe-row'

const SwipeRow = (props: SwipeRowProps) => {
  const {
    children,
    rootRef,
    surfaceRef,
    rootClassName,
    rootStyle,
    direction,
    open,
    phase,
    disabled,
    railId,
    say,
    label,
    secondaryActions,
    primaryAction,
    surfaceXf,
    railXf,
    blockXf,
    glyphXf,
    handlePointerDown,
    handleToggleKey,
    handleToggleClick,
    actionsCount,
    actionsNoun,
  } = useSwipeRow(props)

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={label}
      className={rootClassName}
      data-direction={direction}
      data-open={open ? '' : undefined}
      data-phase={phase}
      data-disabled={disabled ? '' : undefined}
      style={rootStyle}
    >
      <div className={swipeRowShellStyles()}>
        <motion.div
          id={railId}
          className={swipeRowRailStyles()}
          style={{ transform: railXf }}
          inert={!open || undefined}
          aria-hidden={!open}
        >
          {secondaryActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={swipeRowActionStyles()}
              onClick={action.onClick}
              style={action.style}
            >
              <span className={swipeRowActionLabelStyles()}>
                {action.icon ? <span className="inline-flex">{action.icon}</span> : null}
                <span>{action.label}</span>
              </span>
            </button>
          ))}
          {primaryAction ? (
            <motion.div className={swipeRowPrimaryBlockStyles()} style={{ transform: blockXf }}>
              <motion.button
                type="button"
                className={swipeRowPrimaryButtonStyles()}
                style={{ transform: glyphXf }}
                onClick={primaryAction.onClick}
              >
                <span className={swipeRowActionLabelStyles()}>
                  <span className="inline-flex">{primaryAction.icon}</span>
                  <span>{primaryAction.label}</span>
                </span>
              </motion.button>
            </motion.div>
          ) : null}
        </motion.div>
        <motion.div
          ref={surfaceRef}
          className={swipeRowSurfaceStyles()}
          style={{ transform: surfaceXf }}
          onPointerDown={handlePointerDown}
        >
          {children}
          <button
            type="button"
            className={swipeRowToggleStyles()}
            tabIndex={disabled ? -1 : 0}
            aria-expanded={open}
            aria-controls={railId}
            aria-keyshortcuts={direction === 'left' ? 'ArrowLeft' : 'ArrowRight'}
            onKeyDown={handleToggleKey}
            onClick={handleToggleClick}
          >
            {actionsCount} {actionsNoun}
          </button>
        </motion.div>
      </div>
      <span className="sr-only" aria-live="polite">
        {say}
      </span>
    </div>
  )
}

export { SwipeRow }
