import { Link } from '@tanstack/react-router'
import { getYear } from 'date-fns-jalali'
import { ChevronLeft, Target } from 'lucide-react'
import { Progress } from '#/components/progress'
import type { WidgetSize } from '#/modules/dashboard/types'
import type { Plan } from '#/modules/plans/types'
import { STATUS, STATUS_ORDER } from '#/modules/plans/utils/plans.constants'
import { planReport } from '#/modules/plans/utils/report'
import { cn } from '#/modules/shell/utils/cn'
import { toFaDigits } from '#/modules/shell/utils/format'

const TILE = 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 transition-transform'

/** This Jalali year's plan progress. Mini: the percent; small: + bar; large: + count per status. */
const PlansWidget = ({ size, plans }: { size: WidgetSize; plans: Plan[] }) => {
  const year = getYear(new Date())
  const r = planReport(plans.filter((p) => p.year === year))
  const percent = `${toFaDigits(r.percent)}٪`

  if (size === 'mini') {
    return (
      <Link
        to="/plans"
        aria-label={`پیشرفت برنامه‌ها ${percent}`}
        className={cn('-m-2.5 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-3xl', TILE)}
      >
        <span className="text-lg font-bold text-primary">{percent}</span>
        <span className="text-[11px] font-medium">برنامه‌ها</span>
      </Link>
    )
  }

  return (
    <Link to="/plans" className={cn('-m-1 flex flex-1 flex-col gap-2 rounded-2xl p-1', TILE)}>
      <span className="flex items-center gap-2">
        <Target className="size-4" aria-hidden />
        <span className="flex-1 text-sm font-semibold">برنامهٔ {toFaDigits(year)}</span>
        <ChevronLeft className="size-4 text-muted-foreground" aria-hidden />
      </span>
      {r.total ? (
        <>
          <span className="text-3xl font-bold text-primary">{percent}</span>
          <Progress value={r.percent} aria-label="پیشرفت برنامه‌ها" />
          <span className="text-xs text-muted-foreground">
            {toFaDigits(r.counts.done)} از {toFaDigits(r.total)} انجام شده
          </span>
          {size === 'large' && (
            <span className="grid grid-cols-4 gap-1 text-center">
              {STATUS_ORDER.map((s) => (
                <span key={s} className="rounded-lg bg-muted/50 py-1.5">
                  <span className="block text-sm font-semibold">{toFaDigits(r.counts[s])}</span>
                  <span className="block text-[11px] text-muted-foreground">{STATUS[s].label}</span>
                </span>
              ))}
            </span>
          )}
        </>
      ) : (
        <span className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
          برای امسال برنامه‌ای ثبت نشده.
        </span>
      )}
    </Link>
  )
}

export { PlansWidget }
