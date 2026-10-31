import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { toFaDigits } from '#/modules/shell/utils/format'
import { useNow } from '#/modules/shell/hooks/now.hook'
import { reminderRepo } from '#/modules/reminders/apis/reminders.api'
import type { Reminder, ReminderFormValues, RemindersDialog } from '#/modules/reminders/types'
import { dueAt } from '#/modules/reminders/utils/schedule'

const useReminders = () => {
  const search = useSearch({ from: '/reminders' })
  const navigate = useNavigate({ from: '/reminders' })
  const [dialog, setDialog] = useState<RemindersDialog>(search.new ? { type: 'create' } : null)
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
  const active = all.filter((r) => dueAt(r)).sort((a, b) => (dueAt(a)?.getTime() ?? 0) - (dueAt(b)?.getTime() ?? 0))
  const done = all.filter((r) => !dueAt(r)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const toRows = (items: Reminder[]) =>
    items.map((r) => ({
      reminder: r,
      onEdit: () => setDialog({ type: 'edit', item: r }),
      onHistory: () => setDialog({ type: 'history', item: r }),
      onDelete: () => void save(reminderRepo.remove(r.id), 'یادآور حذف شد.'),
    }))

  const tabs = [
    {
      value: 'active',
      label: `فعال (${toFaDigits(active.length)})`,
      rows: toRows(active),
      hasRows: active.length > 0,
      emptyText: 'یادآور فعالی ندارید.',
    },
    {
      value: 'done',
      label: `انجام‌شده (${toFaDigits(done.length)})`,
      rows: toRows(done),
      hasRows: done.length > 0,
      emptyText: 'هنوز یادآوری انجام نشده است.',
    },
  ]

  const editItem = dialog?.type === 'edit' ? dialog.item : undefined
  const historyItem = dialog?.type === 'history' ? dialog.item : undefined

  const handleOpenCreate = () => setDialog({ type: 'create' })
  const handleOpenChange = (open: boolean) => {
    if (!open) close()
  }
  const handleCreate = (v: ReminderFormValues) => save(reminderRepo.create(v), 'یادآور اضافه شد.')
  const handleEdit = async (v: ReminderFormValues) => {
    if (editItem) await save(reminderRepo.update(editItem.id, v), 'تغییرات ذخیره شد.')
  }

  return {
    now,
    tabs,
    isLoading: q.status === 'loading',
    error: q.status === 'error' ? q.error : undefined,
    isEmpty: q.status === 'success' && !all.length,
    hasItems: q.status === 'success' && all.length > 0,
    isCreate: dialog?.type === 'create',
    isEdit: !!editItem,
    isHistory: !!historyItem,
    isFormOpen: dialog?.type === 'create' || dialog?.type === 'edit',
    formTitle: dialog?.type === 'edit' ? 'ویرایش یادآور' : 'یادآور جدید',
    editItem,
    historyReminderId: historyItem?.id ?? '',
    historyDescription: historyItem?.title,
    handleOpenCreate,
    handleOpenChange,
    handleCreate,
    handleEdit,
  }
}

export { useReminders }
