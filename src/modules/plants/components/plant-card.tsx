import { Droplets, History, MoreVertical, Pencil, Sprout, Trash2 } from 'lucide-react'
import { Button } from '#/modules/shell/components/ui/button'
import { Card, CardContent } from '#/modules/shell/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/modules/shell/components/ui/dropdown-menu'
import { usePlantCard } from '#/modules/plants/hooks/plant-card.hook'
import type { PlantCardProps } from '#/modules/plants/types'

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
    <Card className="gap-0 overflow-hidden py-0">
      <div className="relative aspect-[4/3] bg-accent">
        {image && <img src={image} alt={plant.name} className="size-full object-cover" loading="lazy" />}
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
              className="absolute end-2 top-2 rounded-full bg-background/80 backdrop-blur"
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
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardContent className="space-y-3 p-4">
        <div>
          <h3 className="truncate font-semibold">{plant.name}</h3>
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
  )
}

export { PlantCard }
