import { Plus, Wallet } from 'lucide-react'
import { FormDialog } from '#/modules/shell/components/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/modules/shell/components/states'
import { GlassFilter } from '#/modules/shell/components/glass-filter'
import { Button } from '#/components/button'
import { AnimatedList } from '#/modules/shell/components/animated-list'
import { ViewToggle } from '#/modules/shell/components/view-toggle'
import { useViewMode } from '#/modules/shell/hooks/view-toggle.hook'
import { Select } from '#/components/select'
import { FilterSheet } from '#/modules/shell/components/filter-sheet'
import { SwipeHint } from '#/modules/shell/components/swipe-hint'
import { Tabs, TabsList, TabsTrigger } from '#/components/tabs'
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
    activeFilterCount,
    handleResetFilters,
    listLabel,
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
  const { view } = useViewMode('installments')

  return (
    <>
      <PageHeader
        title="اقساط"
        description={headerDescription}
        action={
          <div className="flex items-center gap-2">
            <ViewToggle page="installments" />
            <Button onClick={handleOpenCreate}>
              <Plus /> قسط جدید
            </Button>
          </div>
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
        <>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{periodSummary ?? listLabel}</p>
            <FilterSheet activeCount={activeFilterCount} onReset={handleResetFilters}>
              <Select nested label="سال" value={year} onValueChange={handleYearChange} options={yearOptions} />
              <Select
                nested
                label="ماه"
                value={month}
                onValueChange={handleMonthChange}
                options={monthOptions}
                disabled={isMonthDisabled}
              />
              <Select nested label="مرتب‌سازی" value={sort} onValueChange={handleSortChange} options={sortOptions} />
              {hasTags && <Select nested label="تگ" value={tag} onValueChange={handleTagChange} options={tagOptions} />}
            </FilterSheet>
          </div>
          <SwipeHint />
        </>
      )}
      {isFilterEmpty && <p className="py-10 text-center text-sm text-muted-foreground">قسطی در این دسته نیست.</p>}
      <AnimatedList view={view}>
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
      </AnimatedList>

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
