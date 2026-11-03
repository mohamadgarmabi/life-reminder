import { motion, useReducedMotion } from 'motion/react'
import { Children, isValidElement, type ReactNode } from 'react'
import type { ViewMode } from '#/modules/shell/hooks/view-toggle.hook'
import { cn } from '#/modules/shell/utils/cn'

/** Cap so a long list doesn't keep cascading after the first screenful. */
const MAX_STAGGER = 8

/**
 * Card list that springs its items in one after another on load and glides them between list and grid.
 * Transform only, no fade: an opacity ancestor blanks Chromium's glass (backdrop-filter) until the fade ends.
 * Each item is a `@container`, so cards can rearrange for a narrow grid cell with `@xs:` classes.
 */
const AnimatedList = ({ view, children }: { view: ViewMode; children: ReactNode }) => {
  const reduced = useReducedMotion()
  return (
    <div className={cn('grid gap-3', view === 'grid' ? 'grid-cols-2' : 'grid-cols-1')}>
      {Children.toArray(children).map((child, i) => (
        <motion.div
          key={isValidElement(child) ? child.key : i}
          layout={reduced ? false : 'position'}
          initial={reduced ? false : { y: 28, scale: 0.94 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28, delay: Math.min(i, MAX_STAGGER) * 0.045 }}
          className="@container min-w-0"
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

export { AnimatedList }
