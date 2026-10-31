import { addDays, addHours, addMinutes } from 'date-fns'
import { AlarmClock, Check, History, MoreVertical, Pencil, Repeat, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { formatDate, formatTime, relativeDay } from '#/lib/format'
import { cn } from '#/lib/utils'
import { reminderRepo } from '../repository'
import type { Reminder } from '../schema'
import { dueAt, pendingOccurrence } from '../schedule'
import { RECURRENCE_LABEL } from './reminder-form'

const SNOOZE = [
  { label: '۱۵ دقیقه', at: (now: Date) => addMinutes(now, 15) },
  { label: '۱ ساعت', at: (now: Date) => addHours(now, 1) },
  { label: 'فردا همین ساعت', at: (now: Date) => addDays(now, 1) },
]

export function ReminderCard({ reminder, now, onEdit, onHistory, onDelete }: {
  reminder: Reminder
  now: Date
  onEdit: () => void
  onHistory: () => void
  onDelete: () => void
}) {
  const [busy, setBusy] = useState(false)
  const pending = pendingOccurrence(reminder)
  const due = dueAt(reminder)
  const overdue = !!due && due <= now

  const run = async (task: () => Promise<unknown>, message: string) => {
    setBusy(true)
    try {
      await task()
      toast.success(message)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا در ذخیره‌سازی')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className={cn('gap-0 py-0', overdue && 'border-destructive/50')}>
      <CardContent className="flex items-start gap-3 p-4">
        {pending && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full"
            disabled={busy}
            aria-label={`انجام شد: ${reminder.title}`}
            onClick={() => run(() => reminderRepo.complete(reminder.id, pending.toISOString()), 'انجام شد.')}
          >
            <Check />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn('font-semibold', !pending && 'text-muted-foreground line-through')}>{reminder.title}</h3>
            {reminder.recurrence !== 'none' && (
              <Badge variant="outline"><Repeat /> {RECURRENCE_LABEL[reminder.recurrence]}</Badge>
            )}
          </div>
          {reminder.description && <p className="mt-1 text-sm text-muted-foreground">{reminder.description}</p>}
          {due && (
            <p className={cn('mt-1.5 text-sm', overdue ? 'font-medium text-destructive' : 'text-muted-foreground')}>
              {reminder.snoozedUntil && <AlarmClock className="me-1 inline size-4" aria-label="به تعویق افتاده" />}
              {relativeDay(due, now)} ساعت {formatTime(due)}
              <span className="text-muted-foreground"> · {formatDate(due)}</span>
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`گزینه‌های ${reminder.title}`}>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {pending && (
              <>
                <DropdownMenuLabel>تعویق</DropdownMenuLabel>
                {SNOOZE.map((s) => (
                  <DropdownMenuItem
                    key={s.label}
                    onSelect={() => run(() => reminderRepo.snooze(reminder.id, s.at(new Date())), `به تعویق افتاد: ${s.label}`)}
                  >
                    <AlarmClock /> {s.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onSelect={onEdit}><Pencil /> ویرایش</DropdownMenuItem>
            <DropdownMenuItem onSelect={onHistory}><History /> سابقه</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}><Trash2 /> حذف</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
