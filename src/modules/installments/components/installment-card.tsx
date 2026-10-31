import { Check, History, MoreVertical, Pencil } from 'lucide-react'
import { SwipeRow } from '#/modules/shell/components/swipe-row'
import { Badge } from '#/components/badge'
import { Button } from '#/components/button'
import { Card, CardContent } from '#/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/dropdown-menu'
import { Progress } from '#/components/progress'
import { useInstallmentCard } from '#/modules/installments/hooks/installment-card.hook'
import type { InstallmentCardProps } from '#/modules/installments/types'

const InstallmentCard = ({ inst, today, onEdit, onHistory, onDelete }: InstallmentCardProps) => {
  const {
    paying,
    progress,
    hasNext,
    statusLabel,
    statusVariant,
    amountLabel,
    menuAriaLabel,
    paidCountLabel,
    totalCountLabel,
    remainingLabel,
    lastDueLabel,
    nextDueLabel,
    nextRelativeLabel,
    relativeClassName,
    handlePay,
  } = useInstallmentCard({ inst, today })

  return (
    <SwipeRow
      direction="right"
      label={inst.title}
      actions={[
        { id: 'delete', label: 'حذف', onSelect: onDelete },
        ...(hasNext
          ? [{ id: 'pay', label: 'پرداخت', icon: <Check className="size-5" />, color: '#30a46c', onSelect: handlePay }]
          : []),
      ]}
    >
      <Card className="gap-0 py-0">
        <CardContent className="space-y-2.5 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-semibold">{inst.title}</h3>
                <Badge variant={statusVariant}>{statusLabel}</Badge>
              </div>
              <p className="mt-0.5 font-bold text-primary">{amountLabel}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={menuAriaLabel}>
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onEdit}>
                  <Pencil /> ویرایش
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onHistory}>
                  <History /> سابقهٔ پرداخت
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1">
            <Progress value={progress} aria-label="پیشرفت پرداخت" />
            <p className="text-xs text-muted-foreground">
              {paidCountLabel} از {totalCountLabel} قسط پرداخت شده
              {remainingLabel}
            </p>
            <p className="text-xs text-muted-foreground">آخرین قسط: {lastDueLabel}</p>
            {inst.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {inst.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[11px] font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {hasNext && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs">
                <span className="text-muted-foreground">قسط بعدی: </span>
                {nextDueLabel}
                <span className={relativeClassName}> ({nextRelativeLabel})</span>
              </p>
              <Button size="sm" className="shrink-0" onClick={handlePay} disabled={paying}>
                <Check /> پرداخت شد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </SwipeRow>
  )
}

export { InstallmentCard }
