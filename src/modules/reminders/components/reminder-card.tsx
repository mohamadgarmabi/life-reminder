import { AlarmClock, Check, History, MoreVertical, Pencil, Repeat, Trash2 } from 'lucide-react'
import { Badge } from '#/modules/shell/components/ui/badge'
import { Button } from '#/modules/shell/components/ui/button'
import { Card, CardContent } from '#/modules/shell/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/modules/shell/components/ui/dropdown-menu'
import { useReminderCard } from '#/modules/reminders/hooks/reminder-card.hook'
import type { ReminderCardProps } from '#/modules/reminders/types'

const ReminderCard = (props: ReminderCardProps) => {
  const { reminder, onEdit, onHistory, onDelete } = props
  const {
    busy,
    isPending,
    hasDue,
    isRecurring,
    isSnoozed,
    recurrenceLabel,
    cardClassName,
    titleClassName,
    dueClassName,
    dueRelativeLabel,
    dueTimeLabel,
    dueDateLabel,
    completeAriaLabel,
    menuAriaLabel,
    handleComplete,
    snoozeOptions,
  } = useReminderCard(props)

  return (
    <Card className={cardClassName}>
      <CardContent className="flex items-start gap-3 p-4">
        {isPending && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full"
            disabled={busy}
            aria-label={completeAriaLabel}
            onClick={handleComplete}
          >
            <Check />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={titleClassName}>{reminder.title}</h3>
            {isRecurring && (
              <Badge variant="outline">
                <Repeat /> {recurrenceLabel}
              </Badge>
            )}
          </div>
          {reminder.description && <p className="mt-1 text-sm text-muted-foreground">{reminder.description}</p>}
          {hasDue && (
            <p className={dueClassName}>
              {isSnoozed && <AlarmClock className="me-1 inline size-4" aria-label="به تعویق افتاده" />}
              {dueRelativeLabel} ساعت {dueTimeLabel}
              <span className="text-muted-foreground"> · {dueDateLabel}</span>
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={menuAriaLabel}>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isPending && (
              <>
                <DropdownMenuLabel>تعویق</DropdownMenuLabel>
                {snoozeOptions.map((s) => (
                  <DropdownMenuItem key={s.label} onSelect={s.onSelect}>
                    <AlarmClock /> {s.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil /> ویرایش
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onHistory}>
              <History /> سابقه
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}

export { ReminderCard }
