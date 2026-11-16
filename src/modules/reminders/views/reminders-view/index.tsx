import { CalendarCheck, CalendarSync, ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react'
import { FormDialog } from '#/modules/shell/components/dialogs'
import { ErrorState, ListSkeleton, PageHeader } from '#/modules/shell/components/states'
import { Button } from '#/components/button'
import { ActionSheet } from '#/modules/shell/components/action-sheet'
import { SwipeHint } from '#/modules/shell/components/swipe-hint'
import { ReminderForm } from '#/modules/reminders/components/reminder-form'
import { ReminderHistory } from '#/modules/reminders/components/reminder-history'
import { TimelineCard } from '#/modules/reminders/components/timeline-card'
import { useReminders } from '#/modules/reminders/hooks/reminders.hook'

const RemindersView = () => {
  const {
    isLoading,
    error,
    monthLabel,
    selectedLabel,
    days,
    rows,
    hasRows,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
    isTodaySelected,
    canSync,
    isConnected,
    isWaitingForSignIn,
    syncLabel,
    syncClassName,
    handleConnect,
    handleDisconnect,
    handleRefresh,
    googleMenu,
    isCreate,
    isEdit,
    isHistory,
    isFormOpen,
    formTitle,
    editItem,
    historyReminderId,
    historyDescription,
    handleOpenCreate,
    handleOpenChange,
    handleCreate,
    handleEdit,
  } = useReminders()

  return (
    <>
      <PageHeader
        title="یادآورها"
        action={
          <div className="flex items-center gap-2">
            {canSync && !isConnected && (
              <Button variant="secondary" size="icon" aria-label="اتصال به تقویم گوگل" onClick={handleConnect}>
                <CalendarSync />
              </Button>
            )}
            {canSync && isConnected && (
              <ActionSheet
                title="تقویم گوگل"
                trigger={
                  <Button variant="secondary" size="icon" aria-label="تقویم گوگل">
                    <CalendarCheck />
                  </Button>
                }
                groups={googleMenu}
              />
            )}
            <Button onClick={handleOpenCreate}>
              <Plus /> یادآور جدید
            </Button>
          </div>
        }
      />

      <section aria-label="تقویم" className="space-y-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" aria-label="ماه قبل" onClick={handlePrevMonth}>
            <ChevronRight />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-bold">{monthLabel}</h2>
            {!isTodaySelected && (
              <button type="button" className="text-xs font-medium text-primary" onClick={handleToday}>
                برو به امروز
              </button>
            )}
          </div>
          <Button variant="ghost" size="icon" aria-label="ماه بعد" onClick={handleNextMonth}>
            <ChevronLeft />
          </Button>
        </div>

        <div
          role="listbox"
          aria-label="روزهای ماه"
          className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
        >
          {days.map((d) => (
            <button
              key={d.key}
              ref={d.ref}
              type="button"
              role="option"
              aria-selected={d.isSelected}
              className={d.className}
              onClick={d.onSelect}
            >
              <span className="text-base">{d.number}</span>
              <span className="text-[11px]">{d.weekday}</span>
              <span className={d.dotClassName} aria-hidden />
            </button>
          ))}
        </div>

        {isConnected && (
          <div className="flex items-center justify-between gap-2">
            <p className={syncClassName} role="status">
              {syncLabel}
            </p>
            {isWaitingForSignIn && (
              <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                لغو
              </Button>
            )}
            {!isWaitingForSignIn && (
              <Button variant="ghost" size="icon-sm" aria-label="همگام‌سازی دوباره" onClick={handleRefresh}>
                <RefreshCw />
              </Button>
            )}
          </div>
        )}
      </section>

      <section aria-label={selectedLabel} className="mt-4 rounded-t-[2rem] bg-card/60 px-3 pt-4 pb-2">
        <h3 className="mb-3 px-1 text-sm font-semibold text-muted-foreground">{selectedLabel}</h3>
        {hasRows && <SwipeHint />}
        {isLoading && <ListSkeleton />}
        {error && <ErrorState error={error} />}
        {!isLoading && !hasRows && (
          <p className="py-10 text-center text-sm text-muted-foreground">برای این روز چیزی ثبت نشده.</p>
        )}
        <ol className="relative space-y-3 before:absolute before:inset-y-2 before:start-[3.25rem] before:border-s before:border-dashed before:border-border">
          {rows.map((row) => (
            <li key={row.key} className="grid grid-cols-[3.25rem_1fr] items-center gap-3">
              <time className="text-center text-xs font-medium text-muted-foreground">{row.timeLabel}</time>
              <TimelineCard {...row} />
            </li>
          ))}
        </ol>
      </section>

      <FormDialog open={isFormOpen} onOpenChange={handleOpenChange} title={formTitle}>
        {isCreate && <ReminderForm onSubmit={handleCreate} />}
        {isEdit && <ReminderForm initial={editItem} onSubmit={handleEdit} />}
      </FormDialog>

      <FormDialog
        open={isHistory}
        onOpenChange={handleOpenChange}
        title="سابقهٔ یادآور"
        description={historyDescription}
      >
        {isHistory && <ReminderHistory reminderId={historyReminderId} />}
      </FormDialog>
    </>
  )
}

export default RemindersView
