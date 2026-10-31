import { Bell, Plus } from 'lucide-react'
import { ConfirmDialog, FormDialog } from '#/modules/shell/components/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/modules/shell/components/states'
import { Button } from '#/modules/shell/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/modules/shell/components/ui/tabs'
import { ReminderCard } from '#/modules/reminders/components/reminder-card'
import { ReminderForm } from '#/modules/reminders/components/reminder-form'
import { ReminderHistory } from '#/modules/reminders/components/reminder-history'
import { useReminders } from '#/modules/reminders/hooks/reminders.hook'

const RemindersView = () => {
  const {
    now,
    tabs,
    isLoading,
    error,
    isEmpty,
    hasItems,
    isCreate,
    isEdit,
    isHistory,
    isDelete,
    isFormOpen,
    formTitle,
    editItem,
    historyReminderId,
    historyDescription,
    deleteDescription,
    handleOpenCreate,
    handleOpenChange,
    handleCreate,
    handleEdit,
    handleConfirmDelete,
  } = useReminders()

  return (
    <>
      <PageHeader
        title="یادآورها"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus /> یادآور جدید
          </Button>
        }
      />

      {isLoading && <ListSkeleton />}
      {error && <ErrorState error={error} />}
      {isEmpty && (
        <EmptyState
          icon={Bell}
          title="یادآوری ندارید"
          description="کارهای یک‌باره یا تکراری (روزانه، هفتگی، ماهانه) را اضافه کنید."
          action={
            <Button onClick={handleOpenCreate}>
              <Plus /> افزودن یادآور
            </Button>
          }
        />
      )}
      {hasItems && (
        <Tabs defaultValue="active" dir="rtl">
          <TabsList className="mb-3 w-full">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.hasRows && (
                <div className="space-y-3">
                  {tab.rows.map((row) => (
                    <ReminderCard
                      key={row.reminder.id}
                      reminder={row.reminder}
                      now={now}
                      onEdit={row.onEdit}
                      onHistory={row.onHistory}
                      onDelete={row.onDelete}
                    />
                  ))}
                </div>
              )}
              {!tab.hasRows && <p className="py-10 text-center text-sm text-muted-foreground">{tab.emptyText}</p>}
            </TabsContent>
          ))}
        </Tabs>
      )}

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

      <ConfirmDialog
        open={isDelete}
        onOpenChange={handleOpenChange}
        title="حذف یادآور؟"
        description={deleteDescription}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

export default RemindersView
