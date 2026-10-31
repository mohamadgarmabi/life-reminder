import { createFileRoute, Link } from '@tanstack/react-router'
import { Bell, CalendarCheck, Flower2, Plus, Wallet, type LucideIcon } from 'lucide-react'
import { ErrorState, ListSkeleton } from '#/components/shared/states'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { useLiveQuery } from '#/db/live'
import { buildAgenda, type AgendaItem } from '#/features/dashboard/agenda'
import { installmentRepo } from '#/features/installments/repository'
import { plantRepo } from '#/features/plants/repository'
import { reminderRepo } from '#/features/reminders/repository'
import { formatDateLong, formatMoney, formatTime, relativeDay, toFaDigits } from '#/lib/format'
import { useNow } from '#/lib/use-now'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/')({ component: Dashboard })

const KIND: Record<AgendaItem['kind'], { icon: LucideIcon; to: '/installments' | '/plants' | '/reminders'; label: string }> = {
  installment: { icon: Wallet, to: '/installments', label: 'قسط' },
  plant: { icon: Flower2, to: '/plants', label: 'آبیاری' },
  reminder: { icon: Bell, to: '/reminders', label: 'یادآور' },
}

function Dashboard() {
  const now = useNow()
  const q = useLiveQuery(async () => {
    const [installments, plants, reminders] = await Promise.all([
      installmentRepo.list(),
      plantRepo.list(),
      reminderRepo.list(),
    ])
    return { installments, plants, reminders }
  })
  const agenda = q.data ? buildAgenda(q.data, now) : null

  return (
    <>
      <header className="mb-5 pt-1">
        <p className="text-sm text-muted-foreground">امروز</p>
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight">{formatDateLong(now)}</h1>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-2">
        <QuickAction to="/installments" icon={Wallet} label="قسط" />
        <QuickAction to="/plants" icon={Flower2} label="گیاه" />
        <QuickAction to="/reminders" icon={Bell} label="یادآور" />
      </div>

      {q.status === 'loading' && <ListSkeleton />}
      {q.status === 'error' && <ErrorState error={q.error} />}
      {agenda && (
        <>
          <div className="mb-6 grid grid-cols-3 gap-2 text-center">
            <Stat label="معوق" value={agenda.overdue.length} tone={agenda.overdue.length ? 'danger' : undefined} />
            <Stat label="امروز" value={agenda.today.length} />
            <Stat label="۷ روز آینده" value={agenda.upcoming.length} />
          </div>
          <div className="space-y-4">
            {agenda.overdue.length > 0 && <Section title="معوق" items={agenda.overdue} now={now} danger />}
            <Section title="امروز" items={agenda.today} now={now} empty="برای امروز کاری ثبت نشده. روز آرامی داشته باشید!" />
            <Section title="روزهای آینده" items={agenda.upcoming} now={now} empty="در هفتهٔ پیش رو موردی نیست." />
          </div>
        </>
      )}
    </>
  )
}

function QuickAction({ to, icon: Icon, label }: { to: '/installments' | '/plants' | '/reminders'; icon: LucideIcon; label: string }) {
  return (
    <Button asChild variant="outline" className="h-auto flex-col gap-1.5 rounded-2xl py-3">
      <Link to={to} search={{ new: true }}>
        <span className="relative">
          <Icon className="size-5 text-primary" aria-hidden />
          <Plus className="absolute -end-2 -bottom-1 size-3 rounded-full bg-primary text-primary-foreground" aria-hidden />
        </span>
        <span className="text-xs">{label} جدید</span>
      </Link>
    </Button>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'danger' }) {
  return (
    <div className="glass rounded-2xl p-3">
      <p className={cn('text-xl font-semibold tabular-nums', tone === 'danger' && 'text-destructive')}>{toFaDigits(value)}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function Section({ title, items, now, empty, danger }: {
  title: string
  items: AgendaItem[]
  now: Date
  empty?: string
  danger?: boolean
}) {
  return (
    <Card className={cn('gap-2', danger && 'border-destructive/40')}>
      <CardHeader>
        <CardTitle className={cn('text-base', danger && 'text-destructive')}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <CalendarCheck className="size-4" aria-hidden /> {empty}
          </p>
        ) : (
          <ul className="-mx-2">
            {items.map((item) => {
              const { icon: Icon, to, label } = KIND[item.kind]
              return (
                <li key={item.key}>
                  <Link to={to} className="flex min-h-12 items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-accent active:bg-accent">
                    <span className="rounded-lg bg-secondary p-2 text-foreground">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{item.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {label}
                        {item.installment && ` · ${formatMoney(item.installment.amount, item.installment.currency)}`}
                      </span>
                    </span>
                    <span className={cn('shrink-0 text-xs', danger ? 'text-destructive' : 'text-muted-foreground')}>
                      {relativeDay(item.day, now)}
                      {item.at && ` · ${formatTime(item.at)}`}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
