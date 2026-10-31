import { Plus, Wallet } from 'lucide-react'
import { ConfirmDialog, FormDialog } from '#/modules/shell/components/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/modules/shell/components/states'
import { Button } from '#/modules/shell/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/modules/shell/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '#/modules/shell/components/ui/tabs'
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
    hasItems,
    isFilterEmpty,
    filters,
    filter,
    handleFilterChange,
    year,
    month,
    yearOptions,
    monthOptions,
    isMonthDisabled,
    periodSummary,
    handleYearChange,
    handleMonthChange,
    sort,
    sortOptions,
    handleSortChange,
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
      {hasItems && (
        <Tabs value={filter} onValueChange={handleFilterChange} dir="rtl">
          <TabsList className="mb-3 w-full">
            {filters.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      {hasItems && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="col-span-2 w-full" aria-label="مرتب‌سازی">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={handleMonthChange} disabled={isMonthDisabled}>
            <SelectTrigger className="w-full" aria-label="ماه">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full" aria-label="سال">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {periodSummary && <p className="mb-3 text-sm font-medium">{periodSummary}</p>}
      {isFilterEmpty && <p className="py-10 text-center text-sm text-muted-foreground">قسطی در این دسته نیست.</p>}
      <div className="grid gap-2 sm:grid-cols-2">
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
