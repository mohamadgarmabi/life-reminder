import { Link } from '@tanstack/react-router'
import { ChevronLeft, Flower2, Sprout } from 'lucide-react'
import Image from '#/components/image'
import type { WidgetSize } from '#/modules/dashboard/types'
import type { Plant } from '#/modules/plants/types'
import { cn } from '#/modules/shell/utils/cn'

const TILE = 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 transition-transform'

/** Large: every plant photo in a sideways-scrolling row; small: the first four; mini: a shortcut to the plants page. */
const PlantsWidget = ({ size, plants }: { size: WidgetSize; plants: Plant[] }) => {
  if (size === 'mini') {
    return (
      <Link
        to="/plants"
        className={cn(
          '-m-2.5 flex flex-1 flex-col items-center justify-center gap-1 rounded-3xl text-[11px] font-medium',
          TILE,
        )}
      >
        <Flower2 className="size-6" aria-hidden />
        گیاهان
      </Link>
    )
  }

  const shown = size === 'small' ? plants.slice(0, 4) : plants
  return (
    <>
      <Link to="/plants" className={cn('mb-2 flex items-center gap-2 rounded-lg', TILE)}>
        <Flower2 className="size-4" aria-hidden />
        <span className="flex-1 text-sm font-semibold">گیاهان</span>
        <ChevronLeft className="size-4 text-muted-foreground" aria-hidden />
      </Link>
      {!plants.length && (
        <Link
          to="/plants"
          search={{ new: true }}
          className={cn('flex flex-1 items-center justify-center text-sm text-muted-foreground', TILE)}
        >
          هنوز گیاهی ثبت نشده. افزودن گیاه
        </Link>
      )}
      <ul
        className={cn(
          size === 'small'
            ? 'grid flex-1 grid-cols-2 gap-2'
            : '-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]',
        )}
      >
        {shown.map((plant) => (
          <li key={plant.id} className={cn(size === 'large' && 'shrink-0 snap-start')}>
            <Link
              to="/plants"
              aria-label={plant.name}
              className={cn('flex h-full flex-col items-center justify-center gap-1 rounded-2xl', TILE)}
            >
              <span
                className={cn(
                  'flex items-center justify-center overflow-hidden rounded-2xl bg-accent text-primary/60',
                  size === 'large' ? 'size-20' : 'size-full min-h-10',
                )}
              >
                {plant.image ? (
                  <Image src={plant.image} alt="" className="size-full object-cover" loading="lazy" />
                ) : (
                  <Sprout className="size-8" aria-hidden />
                )}
              </span>
              {size === 'large' && (
                <span className="w-20 truncate text-center text-[11px] font-medium">{plant.name}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export { PlantsWidget }
