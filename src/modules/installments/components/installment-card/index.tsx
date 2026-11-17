import { t } from '#/modules/shell/utils/i18n'
import { Check, History, MoreVertical, Pencil } from 'lucide-react'
import { SwipeRow } from '#/modules/shell/components/swipe-row'
import { Badge } from '#/components/badge'
import { Button } from '#/components/button'
import { Card, CardContent } from '#/components/card'
import { ActionSheet } from '#/modules/shell/components/action-sheet'
import { Progress } from '#/components/progress'
import { useInstallmentCard } from '#/modules/installments/hooks/installment-card.hook'
import type { InstallmentCardProps } from '#/modules/installments/types'

const InstallmentCard = ({ inst, today, onEdit, onHistory, onDelete }: InstallmentCardProps) => {
  const {
    paying,
    progress,
    hasNext,
    statusLabel,
    statusVariant,
    amountLabel,
    menuAriaLabel,
    progressLabel,
    lastDueLabel,
    nextDueLabel,
    nextRelativeLabel,
    relativeClassName,
    handlePay,
  } = useInstallmentCard({ inst, today })

  return (
    <SwipeRow
      direction="right"
      label={inst.title}
      actions={[
        { id: 'delete', label: t('installments.card.delete'), onSelect: onDelete },
        ...(hasNext
          ? [
              {
                id: 'pay',
                label: t('installments.card.pay'),
                icon: <Check className="size-5" />,
                color: '#30a46c',
                onSelect: handlePay,
              },
            ]
          : []),
      ]}
    >
      <Card className="gap-0 py-0">
        <CardContent className="space-y-2.5 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-semibold">{inst.title}</h3>
                <Badge variant={statusVariant}>{statusLabel}</Badge>
              </div>
              <p className="mt-0.5 font-bold text-primary">{amountLabel}</p>
            </div>
            <ActionSheet
              title={inst.title}
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label={menuAriaLabel}>
                  <MoreVertical />
                </Button>
              }
              groups={[
                {
                  items: [
                    { label: t('installments.card.editAction'), icon: <Pencil />, onSelect: onEdit },
                    { label: t('installments.card.history'), icon: <History />, onSelect: onHistory },
                  ],
                },
              ]}
            />
          </div>

          <div className="space-y-1">
            <Progress value={progress} aria-label={t('installments.card.progress')} />
            <p className="text-xs text-muted-foreground">{progressLabel}</p>
            <p className="text-xs text-muted-foreground">{lastDueLabel}</p>
            {inst.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {inst.tags.map((tagName) => (
                  <Badge key={tagName} variant="outline" className="text-[11px] font-normal">
                    {tagName}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Narrow grid cell: the pay button drops under the due date. */}
          {hasNext && (
            <div className="flex flex-col items-stretch gap-2 @xs:flex-row @xs:items-center @xs:justify-between @xs:gap-3">
              <p className="text-xs">
                <span className="text-muted-foreground">{t('installments.card.nextDue')}</span>
                {nextDueLabel}
                <span className={relativeClassName}> ({nextRelativeLabel})</span>
              </p>
              <Button size="sm" className="shrink-0" onClick={handlePay} disabled={paying}>
                <Check /> {t('installments.card.markPaid')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </SwipeRow>
  )
}

export { InstallmentCard }
