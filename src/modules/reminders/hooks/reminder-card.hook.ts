import { useState } from 'react'
import { toast } from '#/components/sonner'
import { formatDate, formatTime, relativeDay } from '#/modules/shell/utils/format'
import { cn } from '#/modules/shell/utils/cn'
import { reminderRepo } from '#/modules/reminders/apis/reminders.api'
import type { ReminderCardProps } from '#/modules/reminders/types'
import { dueAt, pendingOccurrence } from '#/modules/reminders/utils/schedule'
import { RECURRENCE_LABEL, SNOOZE } from '#/modules/reminders/utils/reminders.constants'

const useReminderCard = ({ reminder, now }: ReminderCardProps) => {
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

  const handleComplete = () => {
    if (pending) void run(() => reminderRepo.complete(reminder.id, pending.toISOString()), 'انجام شد.')
  }

  const snoozeOptions = SNOOZE.map((s) => ({
    label: s.label,
    onSelect: () => void run(() => reminderRepo.snooze(reminder.id, s.at(new Date())), `به تعویق افتاد: ${s.label}`),
  }))

  return {
    busy,
    isPending: !!pending,
    hasDue: !!due,
    isRecurring: reminder.recurrence !== 'none',
    isSnoozed: !!reminder.snoozedUntil,
    recurrenceLabel: RECURRENCE_LABEL[reminder.recurrence],
    cardClassName: cn('gap-0 py-0', overdue && 'border-destructive/50'),
    titleClassName: cn('font-semibold', !pending && 'text-muted-foreground line-through'),
    dueClassName: cn('mt-1.5 text-sm', overdue ? 'font-medium text-destructive' : 'text-muted-foreground'),
    dueRelativeLabel: due ? relativeDay(due, now) : '',
    dueTimeLabel: due ? formatTime(due) : '',
    dueDateLabel: due ? formatDate(due) : '',
    completeAriaLabel: `انجام شد: ${reminder.title}`,
    menuAriaLabel: `گزینه‌های ${reminder.title}`,
    handleComplete,
    snoozeOptions,
  }
}

export { useReminderCard }
