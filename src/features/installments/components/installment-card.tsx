import { Check, History, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Progress } from '#/components/ui/progress'
import { formatDateLong, formatMoney, relativeDay, toFaDigits } from '#/lib/format'
import type { IsoDate } from '#/lib/dates'
import { installmentRepo } from '../repository'
import type { Installment } from '../schema'
import { installmentStatus, nextPayment, remainingPayments, type InstallmentStatus } from '../schedule'

const STATUS: Record<InstallmentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  overdue: { label: 'معوق', variant: 'destructive' },
  today: { label: 'سررسید امروز', variant: 'default' },
  soon: { label: 'نزدیک', variant: 'default' },
  upcoming: { label: 'در جریان', variant: 'outline' },
  paused: { label: 'غیرفعال', variant: 'secondary' },
  done: { label: 'تسویه شد', variant: 'secondary' },
}

export function InstallmentCard({ inst, today, onEdit, onHistory, onDelete }: {
  inst: Installment
  today: IsoDate
  onEdit: () => void
  onHistory: () => void
  onDelete: () => void
}) {
  const [paying, setPaying] = useState(false)
  const next = nextPayment(inst)
  const status = installmentStatus(inst, today)
  const progress = (inst.paidPayments / inst.totalPayments) * 100

  async function pay() {
    if (!next) return
    setPaying(true)
    try {
      const payment = await installmentRepo.markPaid(inst.id, next.index)
      toast.success(`قسط ${toFaDigits(next.index + 1)} «${inst.title}» ثبت شد.`, {
        action: { label: 'بازگردانی', onClick: () => void installmentRepo.undoPayment(payment.id).catch(showError) },
      })
    } catch (e) {
      showError(e)
    } finally {
      setPaying(false)
    }
  }

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold">{inst.title}</h3>
              <Badge variant={STATUS[status].variant}>{STATUS[status].label}</Badge>
            </div>
            <p className="mt-1 text-lg font-bold text-primary">{formatMoney(inst.amount, inst.currency)}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`گزینه‌های ${inst.title}`}>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}><Pencil /> ویرایش</DropdownMenuItem>
              <DropdownMenuItem onSelect={onHistory}><History /> سابقهٔ پرداخت</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={onDelete}><Trash2 /> حذف</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1.5">
          <Progress value={progress} aria-label="پیشرفت پرداخت" />
          <p className="text-xs text-muted-foreground">
            {toFaDigits(inst.paidPayments)} از {toFaDigits(inst.totalPayments)} قسط پرداخت شده
            {next && `، ${toFaDigits(remainingPayments(inst))} قسط باقی‌مانده`}
          </p>
        </div>

        {next && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm">
              <span className="text-muted-foreground">قسط بعدی: </span>
              {formatDateLong(next.dueDate)}
              <span className={status === 'overdue' ? 'font-medium text-destructive' : 'text-muted-foreground'}>
                {' '}({relativeDay(next.dueDate)})
              </span>
            </p>
            <Button size="sm" className="h-10 shrink-0" onClick={pay} disabled={paying}>
              <Check /> پرداخت شد
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function showError(e: unknown) {
  toast.error(e instanceof Error ? e.message : 'خطا در ذخیره‌سازی')
}
