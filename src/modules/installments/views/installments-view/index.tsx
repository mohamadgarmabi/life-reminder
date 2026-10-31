import { Plus, Wallet } from 'lucide-react'
import { ConfirmDialog, FormDialog } from '#/modules/shell/components/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/modules/shell/components/states'
import { Button } from '#/modules/shell/components/ui/button'
import { InstallmentCard } from '#/modules/installments/components/installment-card'
import { InstallmentForm } from '#/modules/installments/components/installment-form'
import { PaymentHistory } from '#/modules/installments/components/payment-history'
import { useInstallments } from '#/modules/installments/hooks/installments.hook'

const InstallmentsView = () => {
  const {
    today,
    cards,
    isLoading,
    error,
    isEmpty,
    headerDescription,
    isFormOpen,
    formTitle,
    isCreate,
    editItem,
    historyItem,
    isHistoryOpen,
    isDeleteOpen,
    deleteDescription,
    handleOpenCreate,
    handleOpenChange,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useInstallments()

  return (
    <>
      <PageHeader
        title="اقساط"
        description={headerDescription}
        action={
          <Button onClick={handleOpenCreate}>
            <Plus /> قسط جدید
          </Button>
        }
      />

      {isLoading && <ListSkeleton />}
      {error && <ErrorState error={error} />}
      {isEmpty && (
        <EmptyState
          icon={Wallet}
          title="قسطی ثبت نشده"
          description="وام‌ها و پرداخت‌های ماهانه را اضافه کنید تا سررسیدها را فراموش نکنید."
          action={
            <Button onClick={handleOpenCreate}>
              <Plus /> افزودن قسط
            </Button>
          }
        />
      )}
      <div className="space-y-3">
        {cards.map((card) => (
          <InstallmentCard
            key={card.inst.id}
            inst={card.inst}
            today={today}
            onEdit={card.onEdit}
            onHistory={card.onHistory}
            onDelete={card.onDelete}
          />
        ))}
      </div>

      <FormDialog open={isFormOpen} onOpenChange={handleOpenChange} title={formTitle}>
        {isCreate && <InstallmentForm onSubmit={handleCreate} />}
        {editItem && <InstallmentForm initial={editItem} onSubmit={handleUpdate} />}
      </FormDialog>

      <FormDialog
        open={isHistoryOpen}
        onOpenChange={handleOpenChange}
        title="سابقهٔ پرداخت"
        description={historyItem?.title}
      >
        {historyItem && <PaymentHistory inst={historyItem} />}
      </FormDialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={handleOpenChange}
        title="حذف قسط؟"
        description={deleteDescription}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default InstallmentsView
