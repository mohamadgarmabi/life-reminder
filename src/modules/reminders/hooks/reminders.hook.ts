import { useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AlarmClock, Bell, CalendarDays, Check, History, LogOut, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import { createElement, useState } from 'react'
import { toast } from '#/components/sonner'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { useNow } from '#/modules/shell/hooks/now.hook'
import { cn } from '#/modules/shell/utils/cn'
import { toIsoDate } from '#/modules/shell/utils/dates'
import { formatDateLong, formatTime } from '#/modules/shell/utils/format'
import { useGoogleAccount } from '#/modules/account/hooks/google-account.hook'
import { fetchGoogleEvents } from '#/modules/reminders/apis/google-calendar.api'
import { reminderRepo } from '#/modules/reminders/apis/reminders.api'
import type { ReminderFormValues, RemindersDialog } from '#/modules/reminders/types'
import { dayLabels, monthOf, shiftMonth, timelineByDay } from '#/modules/reminders/utils/calendar'
import type { TimelineEntry } from '#/modules/reminders/utils/calendar'
import { RECURRENCE_LABEL, SNOOZE } from '#/modules/reminders/utils/reminders.constants'

const SYNC_MS = 15 * 60_000

const TONE = {
  done: 'bg-muted',
  upcoming: 'bg-card',
  overdue: 'bg-card ring-1 ring-destructive/50',
  google: 'border border-dashed border-foreground/30 bg-card',
} as const

const BADGE = {
  done: 'انجام شده',
  upcoming: 'در انتظار',
  overdue: 'عقب افتاده',
  google: 'تقویم گوگل',
} as const

const showError = (e: unknown) => toast.error(e instanceof Error ? e.message : 'خطا در ذخیره‌سازی')

const run = (task: Promise<unknown>, message: string) => void task.then(() => toast.success(message)).catch(showError)

/** Keeps the chosen day pill in view when the day or month changes. */
const scrollIntoCenter = (el: HTMLElement | null) =>
  el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })

const useReminders = () => {
  const search = useSearch({ from: '/reminders' })
  const navigate = useNavigate({ from: '/reminders' })
  const [dialog, setDialog] = useState<RemindersDialog>(search.new ? { type: 'create' } : null)
  const now = useNow()
  const today = toIsoDate(now)
  const [selected, setSelected] = useState(today)
  const q = useLiveQuery(() => reminderRepo.list())
  const icon = (Icon: typeof Check) => createElement(Icon)
  const googleAccount = useGoogleAccount()
  const month = monthOf(selected)
  const google = useQuery({
    queryKey: ['google-calendar', googleAccount.session, month.start.toISOString()],
    queryFn: ({ signal }) => fetchGoogleEvents(googleAccount.session ?? '', month.start, month.end, signal),
    enabled: googleAccount.isSignedIn,
    staleTime: SYNC_MS,
    refetchInterval: SYNC_MS,
    refetchOnWindowFocus: true,
  })

  const close = () => {
    setDialog(null)
    if (search.new) void navigate({ search: {}, replace: true })
  }
  const save = async (task: Promise<unknown>, message: string) => {
    try {
      await task
      toast.success(message)
      close()
    } catch (e) {
      showError(e)
    }
  }

  const events = google.data?.connected ? google.data.events : []
  const byDay = timelineByDay(q.data ?? [], events, month.start, month.end)

  const menuFor = (entry: Extract<TimelineEntry, { kind: 'reminder' }>) => {
    const { reminder: r, occurrence } = entry
    const pendingActions = occurrence.isPending
      ? [
          {
            label: 'انجام شد',
            icon: icon(Check),
            onSelect: () => run(reminderRepo.complete(r.id, occurrence.at.toISOString()), 'انجام شد.'),
          },
        ]
      : []
    return [
      {
        items: [
          ...pendingActions,
          { label: 'ویرایش', icon: icon(Pencil), onSelect: () => setDialog({ type: 'edit', item: r }) },
          { label: 'سابقه', icon: icon(History), onSelect: () => setDialog({ type: 'history', item: r }) },
        ],
      },
      ...(occurrence.isPending
        ? [
            {
              label: 'تعویق',
              items: SNOOZE.map((s) => ({
                label: s.label,
                icon: icon(AlarmClock),
                onSelect: () => run(reminderRepo.snooze(r.id, s.at(new Date())), `به تعویق افتاد: ${s.label}`),
              })),
            },
          ]
        : []),
      {
        items: [
          {
            label: 'حذف',
            icon: icon(Trash2),
            destructive: true,
            onSelect: () => run(reminderRepo.remove(r.id), 'یادآور حذف شد.'),
          },
        ],
      },
    ]
  }

  const swipeFor = (entry: Extract<TimelineEntry, { kind: 'reminder' }>) => {
    const { reminder: r, occurrence } = entry
    // First action = full swipe.
    return [
      { id: 'delete', label: 'حذف', onSelect: () => run(reminderRepo.remove(r.id), 'یادآور حذف شد.') },
      ...(occurrence.isPending
        ? [
            {
              id: 'done',
              label: 'انجام شد',
              color: '#30a46c',
              icon: createElement(Check, { className: 'size-5' }),
              onSelect: () => run(reminderRepo.complete(r.id, occurrence.at.toISOString()), 'انجام شد.'),
            },
            {
              id: 'snooze',
              label: 'یک ساعت بعد',
              color: '#f5a524',
              icon: createElement(AlarmClock, { className: 'size-5' }),
              onSelect: () => run(reminderRepo.snooze(r.id, SNOOZE[1].at(new Date())), 'به تعویق افتاد: ۱ ساعت'),
            },
          ]
        : []),
    ]
  }

  const toRow = (entry: TimelineEntry) => {
    const status =
      entry.kind === 'google' ? 'google' : entry.occurrence.isDone ? 'done' : entry.at <= now ? 'overdue' : 'upcoming'
    const isReminder = entry.kind === 'reminder'
    return {
      key: entry.key,
      title: isReminder ? entry.reminder.title : entry.event.title,
      subtitle: isReminder
        ? [RECURRENCE_LABEL[entry.reminder.recurrence], entry.reminder.description].filter(Boolean).join(' · ')
        : entry.allDay
          ? 'تمام روز'
          : `تا ${formatTime(entry.event.end)}`,
      timeLabel: entry.allDay ? 'تمام روز' : formatTime(entry.at),
      badge: BADGE[status],
      badgeClassName: cn(
        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
        status === 'overdue' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground',
      ),
      cardClassName: cn('relative flex items-center gap-3 rounded-3xl p-3 text-card-foreground', TONE[status]),
      titleClassName: cn('truncate font-semibold', status === 'done' && 'line-through opacity-70'),
      Icon: isReminder ? (status === 'done' ? Check : Bell) : CalendarDays,
      menu: isReminder ? menuFor(entry) : null,
      swipe: isReminder ? swipeFor(entry) : null,
      menuAriaLabel: `گزینه‌های ${isReminder ? entry.reminder.title : ''}`,
    }
  }

  const editItem = dialog?.type === 'edit' ? dialog.item : undefined
  const historyItem = dialog?.type === 'history' ? dialog.item : undefined
  const rows = (byDay.get(selected) ?? []).map(toRow)

  return {
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    monthLabel: month.label,
    selectedLabel: selected === today ? `امروز، ${formatDateLong(selected)}` : formatDateLong(selected),
    days: month.days.map((day) => ({
      key: day,
      ...dayLabels(day),
      isSelected: day === selected,
      hasItems: byDay.has(day),
      ref: day === selected ? scrollIntoCenter : undefined,
      className: cn(
        'flex h-16 w-12 shrink-0 snap-center flex-col items-center justify-center gap-0.5 rounded-full border text-sm transition-colors',
        day === selected
          ? 'border-transparent bg-primary font-bold text-primary-foreground'
          : 'border-border bg-card text-muted-foreground',
        day === today && day !== selected && 'border-primary text-foreground',
      ),
      dotClassName: cn('size-1 rounded-full', byDay.has(day) ? 'bg-current' : 'bg-transparent'),
      onSelect: () => setSelected(day),
    })),
    rows,
    hasRows: rows.length > 0,
    handlePrevMonth: () => setSelected(shiftMonth(selected, -1, today)),
    handleNextMonth: () => setSelected(shiftMonth(selected, 1, today)),
    handleToday: () => setSelected(today),
    isTodaySelected: selected === today,
    // Google Calendar connection
    canSync: googleAccount.isAvailable,
    isConnected: !!googleAccount.session,
    isWaitingForSignIn: googleAccount.isWaiting,
    syncLabel: googleAccount.isWaiting
      ? 'در انتظار ورود به حساب گوگل…'
      : google.error
        ? google.error.message
        : google.isFetching
          ? 'در حال همگام‌سازی با تقویم گوگل…'
          : 'همگام با تقویم گوگل',
    syncClassName: cn('text-xs', google.error ? 'text-destructive' : 'text-muted-foreground'),
    handleConnect: googleAccount.signIn,
    handleDisconnect: googleAccount.cancelSignIn,
    handleRefresh: () => void google.refetch(),
    googleMenu: [
      {
        items: [
          { label: 'همگام‌سازی دوباره', icon: icon(RefreshCw), onSelect: () => void google.refetch() },
          { label: 'خروج از حساب گوگل', icon: icon(LogOut), destructive: true, onSelect: googleAccount.signOut },
        ],
      },
    ],
    // Reminder dialogs
    isCreate: dialog?.type === 'create',
    isEdit: !!editItem,
    isHistory: !!historyItem,
    isFormOpen: dialog?.type === 'create' || dialog?.type === 'edit',
    formTitle: dialog?.type === 'edit' ? 'ویرایش یادآور' : 'یادآور جدید',
    editItem,
    historyReminderId: historyItem?.id ?? '',
    historyDescription: historyItem?.title,
    handleOpenCreate: () => setDialog({ type: 'create' }),
    handleOpenChange: (open: boolean) => {
      if (!open) close()
    },
    handleCloseDialog: close,
    handleCreate: (v: ReminderFormValues) => save(reminderRepo.create(v), 'یادآور اضافه شد.'),
    handleEdit: async (v: ReminderFormValues) => {
      if (editItem) await save(reminderRepo.update(editItem.id, v), 'تغییرات ذخیره شد.')
    },
  }
}

export { useReminders }
