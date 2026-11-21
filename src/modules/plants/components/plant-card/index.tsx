import { Check, Droplets, History, MoreVertical, Pencil, SprayCan, Sprout } from 'lucide-react'
import { SwipeRow } from '#/modules/shell/components/swipe-row'
import { Button } from '#/components/button'
import { Card, CardContent } from '#/components/card'
import { ActionSheet } from '#/modules/shell/components/action-sheet'
import { usePlantCard } from '#/modules/plants/hooks/plant-card.hook'
import type { PlantCardProps } from '#/modules/plants/types'
import Image from '#/components/image'
import { t } from '#/modules/shell/utils/i18n'

const PlantCard = ({ plant, today, onEdit, onHistory, onDelete }: PlantCardProps) => {
  const {
    image,
    menuLabel,
    intervalLabel,
    statusClassName,
    statusLabel,
    waterClassName,
    wateredToday,
    waterDisabled,
    waterLabel,
    water,
    hasMisting,
    mistLabel,
    mistStatusLabel,
    mistClassName,
    mistDisabled,
    mist,
  } = usePlantCard({ plant, today })

  return (
    <SwipeRow
      direction="right"
      label={plant.name}
      className="*:first:h-full"
      actionWidth={64}
      actions={[
        { id: 'delete', label: t('plants.delete'), onSelect: onDelete },
        ...(waterDisabled
          ? []
          : [
              {
                id: 'water',
                label: t('plants.water'),
                icon: <Droplets className="size-5" />,
                color: '#0090ff',
                onSelect: water,
              },
            ]),
      ]}
    >
      {/* Wide (list view): photo beside the details instead of above. */}
      <Card className="h-full gap-0 overflow-hidden py-0 @xs:flex-row">
        {/* List view: stretches to the card's full height; absolute children keep the photo from sizing it. */}
        <div className="relative h-32 w-full shrink-0 overflow-hidden bg-accent @xs:h-auto @xs:w-36 @xs:self-stretch">
          {image && (
            <div className="absolute inset-0">
              <Image src={image} alt={plant.name} className="size-full object-cover" loading="lazy" />
            </div>
          )}
          {!image && (
            <div className="absolute inset-0 flex items-center justify-center text-primary/60">
              <Sprout className="size-12" aria-hidden />
            </div>
          )}
          <ActionSheet
            title={plant.name}
            trigger={
              <Button
                variant="secondary"
                size="icon"
                className="absolute inset-e-2 top-2 rounded-full bg-background/80 backdrop-blur"
                aria-label={menuLabel}
              >
                <MoreVertical />
              </Button>
            }
            groups={[
              {
                items: [
                  { label: t('plants.editAction'), icon: <Pencil />, onSelect: onEdit },
                  { label: t('plants.history'), icon: <History />, onSelect: onHistory },
                ],
              },
            ]}
          />
        </div>
        {/* Narrow (mobile grid) cell: smaller type and padding; long labels wrap to two lines. */}
        <CardContent className="flex min-w-0 flex-1 flex-col space-y-2 p-4 @xs:space-y-3 @xs:p-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold @xs:text-base">{plant.name}</h3>
            <p className="truncate text-[11px] text-muted-foreground @xs:text-xs">{intervalLabel}</p>
          </div>
          <p className={statusClassName}>
            <Droplets className="me-1 inline size-3.5 align-[-2px] @xs:size-4" aria-hidden />
            {statusLabel}
          </p>
          {hasMisting && (
            <p className="truncate text-[11px] text-muted-foreground @xs:text-xs">
              <SprayCan className="me-1 inline size-3.5 align-[-2px]" aria-hidden />
              {mistStatusLabel}
            </p>
          )}
          <div className="mt-auto flex gap-2">
            <Button size="sm" variant={'default'} className={waterClassName} onClick={water} disabled={waterDisabled}>
              {wateredToday ? <Check /> : <Droplets />}
              <span className="truncate">{waterLabel}</span>
            </Button>
            {hasMisting && (
              <Button
                size="icon-sm"
                className={mistClassName}
                onClick={mist}
                disabled={mistDisabled}
                aria-label={mistLabel}
                title={mistLabel}
              >
                <SprayCan />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </SwipeRow>
  )
}

export { PlantCard }
