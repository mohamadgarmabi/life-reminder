import { Coins, DollarSign, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { Skeleton } from '#/components/skeleton'
import type { WidgetSize } from '#/modules/dashboard/types'
import { compactPrice, formatPrice, PRICE_LABELS, type Price, type PriceId } from '#/modules/dashboard/utils/prices'
import { cn } from '#/modules/shell/utils/cn'
import { toLocalDigits } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'

const META: Record<PriceId, { icon: LucideIcon; tint: string }> = {
  dollar: { icon: DollarSign, tint: 'bg-emerald-500/15 text-emerald-600' },
  gold: { icon: Coins, tint: 'bg-amber-400/20 text-amber-600' },
}

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
      <bdi dir="ltr">{`${up ? '+' : ''}${toLocalDigits(percent.toFixed(2))}${t('dashboard.price.percent')}`}</bdi>
    </span>
  )
}

type PriceWidgetProps = { id: PriceId; size: WidgetSize; price: Price | null | undefined; failed: boolean }

/** One market price tile, Chand-style: name, big price (toman, or USD in English), coloured daily change. */
const PriceWidget = ({ id, size, price, failed }: PriceWidgetProps) => {
  const meta = META[id]
  const labels = PRICE_LABELS[id]
  const Icon = meta.icon
  const stale = failed && price && <p className="text-[11px] text-muted-foreground">{t('dashboard.price.stale')}</p>

  if (price === undefined && !failed) return <Skeleton className="h-full w-full rounded-2xl" />

  if (size === 'mini') {
    return (
      <div className="m-auto flex flex-col items-center gap-0.5 text-center">
        <p className="text-[11px] font-semibold text-muted-foreground">{t(labels.short)}</p>
        <p className="text-sm leading-tight font-bold tabular-nums">{price ? compactPrice(price.price) : '—'}</p>
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
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
          {t(size === 'large' ? labels.title : labels.short)}
        </p>
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
            {formatPrice(price.price)}
          </p>
          <p className="text-xs text-muted-foreground">{t(labels.unit)}</p>
          {size === 'small' && <Change percent={price.changePercent} className="mt-1 text-sm" />}
          {size === 'large' && (
            <p className="mt-2 flex gap-3 text-xs text-muted-foreground tabular-nums">
              <span>{t('dashboard.price.high', { n: formatPrice(price.high) })}</span>
              <span>{t('dashboard.price.low', { n: formatPrice(price.low) })}</span>
            </p>
          )}
          {stale}
        </>
      ) : (
        <p className="mt-auto text-sm text-muted-foreground">{t('dashboard.price.unavailable')}</p>
      )}
    </>
  )
}

export { PriceWidget }
