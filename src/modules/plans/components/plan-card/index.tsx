import { Check, MoreVertical, Pencil, Play, Redo2, Trash2, Undo2 } from 'lucide-react'
import { SwipeRow } from '#/modules/shell/components/swipe-row'
import { Badge } from '#/components/badge'
import { Button } from '#/components/button'
import { Card, CardContent } from '#/components/card'
import { ActionSheet } from '#/modules/shell/components/action-sheet'
import { cn } from '#/modules/shell/utils/cn'
import { usePlanCard } from '#/modules/plans/hooks/plan-card.hook'
import type { PlanCardProps } from '#/modules/plans/types'

const ICONS = { done: Check, skip: Redo2, reset: Undo2, delete: Trash2 } as const

const PlanCard = ({ plan, onEdit }: PlanCardProps) => {
  const {
    swipeActions,
    statusActions,
    deleteAction,
    statusLabel,
    statusVariant,
    yearLabel,
    isFinished,
    menuAriaLabel,
    nextStep,
  } = usePlanCard(plan)

  return (
    <SwipeRow
      direction="right"
      label={plan.title}
      actions={swipeActions.map((a) => {
        const Icon = ICONS[a.id as keyof typeof ICONS]
        return Icon ? { ...a, icon: <Icon className="size-5" /> } : a
      })}
    >
      <Card className="gap-0 py-0">
        <CardContent className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={cn('truncate text-sm font-semibold', isFinished && 'text-muted-foreground line-through')}
                >
                  {plan.title}
                </h3>
                <Badge variant={statusVariant}>{statusLabel}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">سال {yearLabel}</p>
            </div>
            <ActionSheet
              title={plan.title}
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label={menuAriaLabel}>
                  <MoreVertical />
                </Button>
              }
              groups={[
                {
                  items: [
                    { label: 'ویرایش', icon: <Pencil />, onSelect: onEdit },
                    ...statusActions.map((a) => {
                      const Icon = ICONS[a.id]
                      return { label: a.label, icon: <Icon />, onSelect: a.onSelect }
                    }),
                  ],
                },
                {
                  items: [
                    { label: deleteAction.label, icon: <Trash2 />, onSelect: deleteAction.onSelect, destructive: true },
                  ],
                },
              ]}
            />
          </div>

          {plan.description && (
            <p className="line-clamp-3 text-sm whitespace-pre-line text-muted-foreground">{plan.description}</p>
          )}

          {(plan.tags.length > 0 || nextStep) && (
            <div className="flex items-end justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {plan.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[11px] font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
              {nextStep && (
                <Button size="sm" variant="outline" className="shrink-0" onClick={nextStep.onClick}>
                  {nextStep.kind === 'start' ? <Play /> : <Check />} {nextStep.label}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </SwipeRow>
  )
}

export { PlanCard }
