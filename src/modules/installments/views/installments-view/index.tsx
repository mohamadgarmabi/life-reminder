import { t } from '#/modules/shell/utils/i18n'
import { Plus, Wallet } from 'lucide-react'
import { FormDialog } from '#/modules/shell/components/dialogs'
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '#/modules/shell/components/states'
import { Button } from '#/components/button'
import { AnimatedList } from '#/modules/shell/components/animated-list'
import { ViewToggle } from '#/modules/shell/components/view-toggle'
import { useViewMode } from '#/modules/shell/hooks/view-toggle.hook'
import { Select } from '#/components/select'
import { FilterSheet } from '#/modules/shell/components/filter-sheet'
import { SwipeHint } from '#/modules/shell/components/swipe-hint'
import { GlassTabs } from '#/components/liquid-glass'
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
        title={t('installments.title')}
        description={headerDescription}
        action={
          <div className="flex items-center gap-2">
            <ViewToggle page="installments" />
            <Button onClick={handleOpenCreate}>
              <Plus /> {t('installments.new')}
            </Button>
          </div>
        }
      >
        {hasItems && (
          <GlassTabs
            aria-label={t('installments.title')}
            size="sm"
            value={filter}
            onValueChange={handleFilterChange}
            options={filters}
            className="w-full"
          />
        )}
      </PageHeader>

      {isLoading && <ListSkeleton />}
      {error && <ErrorState error={error} />}
      {isEmpty && (
        <EmptyState
          icon={Wallet}
          title={t('installments.empty.title')}
          description={t('installments.empty.description')}
          action={
            <Button onClick={handleOpenCreate}>
              <Plus /> {t('installments.add')}
            </Button>
          }
        />
      )}
      {hasItems && (
        <>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{periodSummary ?? listLabel}</p>
            <FilterSheet activeCount={activeFilterCount} onReset={handleResetFilters}>
              <Select
                nested
                label={t('installments.filter.year')}
                value={year}
                onValueChange={handleYearChange}
                options={yearOptions}
              />
              <Select
                nested
                label={t('installments.filter.month')}
                value={month}
                onValueChange={handleMonthChange}
                options={monthOptions}
                disabled={isMonthDisabled}
              />
              <Select
                nested
                label={t('installments.filter.sort')}
                value={sort}
                onValueChange={handleSortChange}
                options={sortOptions}
              />
              {hasTags && (
                <Select
                  nested
                  label={t('installments.filter.tag')}
                  value={tag}
                  onValueChange={handleTagChange}
                  options={tagOptions}
                />
              )}
            </FilterSheet>
          </div>
          <SwipeHint />
        </>
      )}
      {isFilterEmpty && (
        <p className="py-10 text-center text-sm text-muted-foreground">{t('installments.filter.empty')}</p>
      )}
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

      <FormDialog open={isFormOpen} onOpenChange={handleOpenChange} title={formTitle} size="full">
        {isCreate && <InstallmentForm onSubmit={handleCreate} />}
        {editItem && <InstallmentForm initial={editItem} onSubmit={handleUpdate} />}
      </FormDialog>

      <FormDialog
        open={isHistoryOpen}
        onOpenChange={handleOpenChange}
        title={t('installments.card.history')}
        description={historyItem?.title}
      >
        {historyItem && <PaymentHistory inst={historyItem} />}
      </FormDialog>
    </>
  )
}

export default InstallmentsView
