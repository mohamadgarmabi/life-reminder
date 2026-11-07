import { Maximize2, Minimize2 } from 'lucide-react'
import { motion } from 'motion/react'
import { GlassLayer } from '#/components/glass'
import { useWidget } from '#/modules/dashboard/hooks/widget.hook'
import type { WidgetProps } from '#/modules/dashboard/types'
import { cn } from '#/modules/shell/utils/cn'

const SPAN = {
  // Square grid cells (home view): mini 1×1, small 2×2, so tiles can be mixed in any order.
  mini: 'col-span-1',
  small: 'col-span-2 row-span-2',
  large: 'col-span-4 min-h-40',
} as const

/** Home-screen tile. Long-press (or the header's «ویرایش») enters edit mode: drag to reorder, corner button resizes. */
const Widget = (props: WidgetProps) => {
  const { config, editing, children } = props
  const { size, sizeLabel, handleDrag, handleToggleSize, pressHandlers } = useWidget(props)

  return (
    <motion.div
      layout
      data-widget={config.id}
      drag={editing}
      dragSnapToOrigin
      dragMomentum={false}
      whileDrag={{ scale: 1.05, zIndex: 20 }}
      onDrag={handleDrag}
      {...pressHandlers}
      className={cn(
        'relative select-none [-webkit-touch-callout:none]',
        SPAN[size],
        editing && 'touch-none cursor-grab active:cursor-grabbing',
      )}
    >
      <div
        // Edit mode: links inside stop reacting so a press always grabs the tile.
        inert={editing}
        className={cn(
          'relative isolate flex h-full flex-col rounded-3xl',
          size === 'mini' ? 'p-2.5' : 'p-4',
          editing && 'widget-wiggle',
        )}
      >
        <GlassLayer radius={24} />
        {children}
      </div>
      {editing && (
        <button
          type="button"
          aria-label={sizeLabel}
          onClick={handleToggleSize}
          className="absolute -top-2 -inset-s-2 z-10 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {size === 'large' ? (
            <Minimize2 className="size-3.5" aria-hidden />
          ) : (
            <Maximize2 className="size-3.5" aria-hidden />
          )}
        </button>
      )}
    </motion.div>
  )
}

export { Widget }
