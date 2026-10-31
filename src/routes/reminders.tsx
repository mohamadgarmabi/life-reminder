import { createFileRoute } from '@tanstack/react-router'
import { Bell, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConfirmDialog, FormDialog } from '#/components/shared/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/components/shared/states'
import { Button } from '#/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useLiveQuery } from '#/db/live'
import { ReminderCard } from '#/features/reminders/components/reminder-card'
import { ReminderForm } from '#/features/reminders/components/reminder-form'
import { ReminderHistory } from '#/features/reminders/components/reminder-history'
import { reminderRepo } from '#/features/reminders/repository'
import type { Reminder } from '#/features/reminders/schema'
import { dueAt } from '#/features/reminders/schedule'
import { toFaDigits } from '#/lib/format'
import { useNow } from '#/lib/use-now'

export const Route = createFileRoute('/reminders')({
  validateSearch: z.object({ new: z.boolean().optional() }),
  component: RemindersPage,
})

type Dialog = { type: 'create' } | { type: 'edit' | 'history' | 'delete'; item: Reminder } | null

function RemindersPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [dialog, setDialog] = useState<Dialog>(search.new ? { type: 'create' } : null)
  const now = useNow()
  const q = useLiveQuery(() => reminderRepo.list())

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
      toast.error(e instanceof Error ? e.message : 'خطا در ذخیره‌سازی')
    }
  }

  const all = q.data ?? []
  const active = all
    .filter((r) => dueAt(r))
    .sort((a, b) => (dueAt(a)?.getTime() ?? 0) - (dueAt(b)?.getTime() ?? 0))
  const done = all.filter((r) => !dueAt(r)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const list = (items: Reminder[], empty: string) =>
    items.length ? (
      <div className="space-y-3">
        {items.map((r) => (
          <ReminderCard
            key={r.id}
            reminder={r}
            now={now}
            onEdit={() => setDialog({ type: 'edit', item: r })}
            onHistory={() => setDialog({ type: 'history', item: r })}
            onDelete={() => setDialog({ type: 'delete', item: r })}
          />
        ))}
      </div>
    ) : (
      <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>
    )

  return (
    <>
      <PageHeader
        title="یادآورها"
        action={<Button onClick={() => setDialog({ type: 'create' })}><Plus /> یادآور جدید</Button>}
      />

      {q.status === 'loading' && <ListSkeleton />}
      {q.status === 'error' && <ErrorState error={q.error} />}
      {q.status === 'success' && !all.length && (
        <EmptyState
          icon={Bell}
          title="یادآوری ندارید"
          description="کارهای یک‌باره یا تکراری (روزانه، هفتگی، ماهانه) را اضافه کنید."
          action={<Button onClick={() => setDialog({ type: 'create' })}><Plus /> افزودن یادآور</Button>}
        />
      )}
      {q.status === 'success' && all.length > 0 && (
        <Tabs defaultValue="active" dir="rtl">
          <TabsList className="mb-3 w-full">
            <TabsTrigger value="active">فعال ({toFaDigits(active.length)})</TabsTrigger>
            <TabsTrigger value="done">انجام‌شده ({toFaDigits(done.length)})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">{list(active, 'یادآور فعالی ندارید.')}</TabsContent>
          <TabsContent value="done">{list(done, 'هنوز یادآوری انجام نشده است.')}</TabsContent>
        </Tabs>
      )}

      <FormDialog
        open={dialog?.type === 'create' || dialog?.type === 'edit'}
        onOpenChange={(o) => !o && close()}
        title={dialog?.type === 'edit' ? 'ویرایش یادآور' : 'یادآور جدید'}
      >
        {dialog?.type === 'create' && <ReminderForm onSubmit={(v) => save(reminderRepo.create(v), 'یادآور اضافه شد.')} />}
        {dialog?.type === 'edit' && (
          <ReminderForm initial={dialog.item} onSubmit={(v) => save(reminderRepo.update(dialog.item.id, v), 'تغییرات ذخیره شد.')} />
        )}
      </FormDialog>

      <FormDialog
        open={dialog?.type === 'history'}
        onOpenChange={(o) => !o && close()}
        title="سابقهٔ یادآور"
        description={dialog?.type === 'history' ? dialog.item.title : undefined}
      >
        {dialog?.type === 'history' && <ReminderHistory reminderId={dialog.item.id} />}
      </FormDialog>

      <ConfirmDialog
        open={dialog?.type === 'delete'}
        onOpenChange={(o) => !o && close()}
        title="حذف یادآور؟"
        description={dialog?.type === 'delete' ? `«${dialog.item.title}» و سابقهٔ آن برای همیشه حذف می‌شود.` : ''}
        onConfirm={() => dialog?.type === 'delete' && void save(reminderRepo.remove(dialog.item.id), 'یادآور حذف شد.')}
      />
    </>
  )
}
