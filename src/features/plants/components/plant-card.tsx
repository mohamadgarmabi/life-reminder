import { Droplets, History, MoreVertical, Pencil, Sprout, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import type { IsoDate } from '#/lib/dates'
import { formatDayMonth, relativeDay, toFaDigits } from '#/lib/format'
import { cn } from '#/lib/utils'
import { plantRepo } from '../repository'
import type { Plant } from '../schema'
import { daysUntilWatering, nextWateringDate } from '../schedule'

export function PlantCard({ plant, today, onEdit, onHistory, onDelete }: {
  plant: Plant
  today: IsoDate
  onEdit: () => void
  onHistory: () => void
  onDelete: () => void
}) {
  const [busy, setBusy] = useState(false)
  const days = daysUntilWatering(plant, today)
  const next = nextWateringDate(plant)
  const wateredToday = plant.lastWateredAt === today

  async function water() {
    setBusy(true)
    try {
      const added = await plantRepo.markWatered(plant.id)
      if (added) toast.success(`${plant.name} آبیاری شد.`)
      else toast.info('آبیاری امروز قبلاً ثبت شده است.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا در ذخیره‌سازی')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="relative aspect-[4/3] bg-accent">
        {plant.image ? (
          <img src={plant.image} alt={plant.name} className="size-full object-cover" loading="lazy" />
        ) : (
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
              aria-label={`گزینه‌های ${plant.name}`}
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}><Pencil /> ویرایش</DropdownMenuItem>
            <DropdownMenuItem onSelect={onHistory}><History /> سابقهٔ آبیاری</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}><Trash2 /> حذف</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardContent className="space-y-3 p-4">
        <div>
          <h3 className="truncate font-semibold">{plant.name}</h3>
          <p className="text-xs text-muted-foreground">هر {toFaDigits(plant.wateringIntervalDays)} روز</p>
        </div>
        <p className={cn('text-sm', days < 0 ? 'font-medium text-destructive' : days === 0 ? 'font-medium text-primary' : 'text-muted-foreground')}>
          <Droplets className="me-1 inline size-4" aria-hidden />
          {days < 0 ? `آبیاری عقب افتاده (${relativeDay(next)})` : `آبیاری بعدی: ${relativeDay(next)} · ${formatDayMonth(next)}`}
        </p>
        <Button
          className="w-full"
          variant={days <= 0 && !wateredToday ? 'default' : 'outline'}
          onClick={water}
          disabled={busy || wateredToday}
        >
          <Droplets /> {wateredToday ? 'امروز آبیاری شد' : 'آب دادم'}
        </Button>
      </CardContent>
    </Card>
  )
}
