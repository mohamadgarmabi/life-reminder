import type { WidgetSize } from '#/modules/dashboard/types'
import { formatDateLong, formatTime, jalali } from '#/modules/shell/utils/format'

const DateWidget = ({ size, now, summary }: { size: WidgetSize; now: Date; summary?: string }) => {
  if (size === 'mini') {
    return (
      <div className="m-auto text-center">
        <p className="text-[11px] font-semibold text-destructive">{jalali(now, 'EEEE')}</p>
        <p className="text-3xl leading-none font-bold tabular-nums">{jalali(now, 'd')}</p>
      </div>
    )
  }
  if (size === 'small') {
    return (
      <>
        <p className="text-sm font-semibold text-destructive">{jalali(now, 'EEEE')}</p>
        <p className="mt-auto text-6xl leading-none font-bold tabular-nums">{jalali(now, 'd')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{jalali(now, 'MMMM yyyy')}</p>
      </>
    )
  }
  return (
    <>
      <p className="text-sm font-semibold text-destructive">{formatDateLong(now)}</p>
      <p className="mt-auto text-5xl leading-none font-bold tabular-nums">{formatTime(now)}</p>
      {summary && <p className="mt-2 text-sm text-muted-foreground">{summary}</p>}
    </>
  )
}

export { DateWidget }
