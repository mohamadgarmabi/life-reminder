import { Plus, Wallet } from 'lucide-react'
import { FormDialog } from '#/modules/shell/components/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/modules/shell/components/states'
import { GlassFilter } from '#/modules/shell/components/glass-filter'
import { Button } from '#/modules/shell/components/ui/button'
import { Select } from '#/modules/shell/components/ui/select'
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
    tag,
    hasTags,
    tagOptions,
    handleTagChange,
    headerDescription,
    isFormOpen,
    formTitle,
    isCreate,
    editItem,
    historyItem,
    isHistoryOpen,
    handleOpenCreate,
    handleOpenChange,
    handleCreate,
    handleUpdate,
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
      >
        {hasItems && (
          <Tabs value={filter} onValueChange={handleFilterChange} dir="rtl">
            <GlassFilter>
              <TabsList className="w-full">
                {filters.map((f) => (
                  <TabsTrigger key={f.value} value={f.value}>
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </GlassFilter>
          </Tabs>
        )}
      </PageHeader>

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
        <div className="mb-3 grid grid-cols-2 gap-2">
          <Select
            label="مرتب‌سازی"
            value={sort}
            onValueChange={handleSortChange}
            options={sortOptions}
            className={hasTags ? 'w-full' : 'col-span-2 w-full'}
          />
          {hasTags && (
            <Select label="تگ" value={tag} onValueChange={handleTagChange} options={tagOptions} className="w-full" />
          )}
          <Select
            label="ماه"
            value={month}
            onValueChange={handleMonthChange}
            options={monthOptions}
            disabled={isMonthDisabled}
            className="w-full"
          />
          <Select label="سال" value={year} onValueChange={handleYearChange} options={yearOptions} className="w-full" />
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
    </>
  )
}

export default InstallmentsView
