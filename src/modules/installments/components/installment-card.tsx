import { Check, History, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '#/modules/shell/components/ui/badge'
import { Button } from '#/modules/shell/components/ui/button'
import { Card, CardContent } from '#/modules/shell/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/modules/shell/components/ui/dropdown-menu'
import { Progress } from '#/modules/shell/components/ui/progress'
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
    nextDueLabel,
    nextRelativeLabel,
    relativeClassName,
    handlePay,
  } = useInstallmentCard({ inst, today })

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold">{inst.title}</h3>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </div>
            <p className="mt-1 text-lg font-bold text-primary">{amountLabel}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={menuAriaLabel}>
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
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2 /> حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1.5">
          <Progress value={progress} aria-label="پیشرفت پرداخت" />
          <p className="text-xs text-muted-foreground">
            {paidCountLabel} از {totalCountLabel} قسط پرداخت شده
            {remainingLabel}
          </p>
        </div>

        {hasNext && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm">
              <span className="text-muted-foreground">قسط بعدی: </span>
              {nextDueLabel}
              <span className={relativeClassName}> ({nextRelativeLabel})</span>
            </p>
            <Button size="sm" className="h-10 shrink-0" onClick={handlePay} disabled={paying}>
              <Check /> پرداخت شد
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { InstallmentCard }
