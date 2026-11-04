import { Droplets, History, MoreVertical, Pencil, Sprout } from 'lucide-react'
import { SwipeRow } from '#/modules/shell/components/swipe-row'
import { Button } from '#/components/button'
import { Card, CardContent } from '#/components/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '#/components/dropdown-menu'
import { usePlantCard } from '#/modules/plants/hooks/plant-card.hook'
import type { PlantCardProps } from '#/modules/plants/types'
import Image from '#/components/image'

const PlantCard = ({ plant, today, onEdit, onHistory, onDelete }: PlantCardProps) => {
  const {
    image,
    menuLabel,
    intervalLabel,
    statusClassName,
    statusLabel,
    waterVariant,
    waterDisabled,
    waterLabel,
    water,
  } = usePlantCard({ plant, today })

  return (
    <SwipeRow
      direction="right"
      label={plant.name}
      actionWidth={64}
      actions={[
        { id: 'delete', label: 'حذف', onSelect: onDelete },
        ...(waterDisabled
          ? []
          : [
              {
                id: 'water',
                label: 'آب دادم',
                icon: <Droplets className="size-5" />,
                color: '#0090ff',
                onSelect: water,
              },
            ]),
      ]}
    >
      {/* Wide (list view): photo beside the details instead of above. */}
      <Card className="gap-0 overflow-hidden py-0 @xs:flex-row">
        <div className="relative aspect-4/3 bg-accent @xs:aspect-auto @xs:w-36 @xs:shrink-0">
          {image && <Image src={image} alt={plant.name} className="size-full object-cover" loading="lazy" />}
          {!image && (
            <div className="flex size-full items-center justify-center text-primary/60">
              <Sprout className="size-12" aria-hidden />
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute inset-e-2 top-2 rounded-full bg-background/80 backdrop-blur"
                aria-label={menuLabel}
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil /> ویرایش
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onHistory}>
                <History /> سابقهٔ آبیاری
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardContent className="space-y-3 p-4 @xs:flex-1">
          <div>
            <h3 className="text-ellipsis font-semibold">{plant.name}</h3>
            <p className="text-xs text-muted-foreground">هر {intervalLabel} روز</p>
          </div>
          <p className={statusClassName}>
            <Droplets className="me-1 inline size-4" aria-hidden />
            {statusLabel}
          </p>
          <Button className="w-full" variant={waterVariant} onClick={water} disabled={waterDisabled}>
            <Droplets /> {waterLabel}
          </Button>
        </CardContent>
      </Card>
    </SwipeRow>
  )
}

export { PlantCard }
