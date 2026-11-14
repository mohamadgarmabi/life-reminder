import { Coins, DollarSign, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { Skeleton } from '#/components/skeleton'
import type { WidgetSize } from '#/modules/dashboard/types'
import type { Price, PriceId } from '#/modules/dashboard/utils/prices'
import { cn } from '#/modules/shell/utils/cn'
import { formatNumber, toFaDigits } from '#/modules/shell/utils/format'

const META: Record<PriceId, { title: string; short: string; icon: LucideIcon; tint: string }> = {
  dollar: { title: 'دلار آزاد', short: 'دلار', icon: DollarSign, tint: 'bg-emerald-500/15 text-emerald-600' },
  gold: { title: 'طلای ۱۸ عیار (گرم)', short: 'طلا', icon: Coins, tint: 'bg-amber-400/20 text-amber-600' },
}

/** "۲۶۶ هزار" / "۲۵٫۰ میلیون": fits a 1×1 tile. */
const compact = (toman: number) =>
  toman >= 1_000_000
    ? `${formatNumber(Math.round(toman / 100_000) / 10)} میلیون`
    : `${formatNumber(Math.round(toman / 1000))} هزار`

const Change = ({ percent, className }: { percent: number; className?: string }) => {
  const up = percent > 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 tabular-nums',
        percent === 0 ? 'text-muted-foreground' : up ? 'text-emerald-600' : 'text-destructive',
        className,
      )}
    >
      {percent !== 0 && <Icon className="size-3.5" aria-hidden />}
      {/* LTR so the sign sits before the number. */}
      <bdi dir="ltr">{`${up ? '+' : ''}${toFaDigits(percent.toFixed(2))}٪`}</bdi>
    </span>
  )
}

type PriceWidgetProps = { id: PriceId; size: WidgetSize; price: Price | null | undefined; failed: boolean }

/** One market price tile, Chand-style: name, big price in toman, coloured daily change. */
const PriceWidget = ({ id, size, price, failed }: PriceWidgetProps) => {
  const meta = META[id]
  const Icon = meta.icon
  const stale = failed && price && <p className="text-[11px] text-muted-foreground">به‌روز نشد</p>

  if (price === undefined && !failed) return <Skeleton className="h-full w-full rounded-2xl" />

  if (size === 'mini') {
    return (
      <div className="m-auto flex flex-col items-center gap-0.5 text-center">
        <p className="text-[11px] font-semibold text-muted-foreground">{meta.short}</p>
        <p className="text-sm leading-tight font-bold tabular-nums">{price ? compact(price.price) : '—'}</p>
        {price && <Change percent={price.changePercent} className="text-[10px]" />}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className={cn('grid size-8 place-items-center rounded-full', meta.tint)} aria-hidden>
          <Icon className="size-4" />
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">{size === 'large' ? meta.title : meta.short}</p>
        {size === 'large' && price && <Change percent={price.changePercent} className="text-sm" />}
      </div>
      {price ? (
        <>
          <p
            className={cn(
              'mt-auto leading-tight font-bold tabular-nums',
              size === 'large' ? 'text-4xl' : 'text-2xl',
              // Gold has 8 digits; keep it on one line in a half-width tile.
              size === 'small' && price.price >= 10_000_000 && 'text-xl',
            )}
          >
            {formatNumber(price.price)}
          </p>
          <p className="text-xs text-muted-foreground">تومان</p>
          {size === 'small' && <Change percent={price.changePercent} className="mt-1 text-sm" />}
          {size === 'large' && (
            <p className="mt-2 flex gap-3 text-xs text-muted-foreground tabular-nums">
              <span>بیشترین {formatNumber(price.high)}</span>
              <span>کمترین {formatNumber(price.low)}</span>
            </p>
          )}
          {stale}
        </>
      ) : (
        <p className="mt-auto text-sm text-muted-foreground">قیمت در دسترس نیست</p>
      )}
    </>
  )
}

export { PriceWidget }
