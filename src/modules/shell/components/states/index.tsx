import { AlertTriangle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '#/components/alert'
import { Skeleton } from '#/components/skeleton'
import { useListSkeleton } from '#/modules/shell/hooks/states.hook'

// Sticky on every page; children (e.g. filter tabs) stick with it.
const PageHeader = ({
  title,
  description,
  leading,
  action,
  children,
}: {
  title: string
  description?: string
  /** Shown right before the title (e.g. a back button). */
  leading?: ReactNode
  action?: ReactNode
  children?: ReactNode
}) => {
  return (
    // Edge-to-edge bar in the page colour; content fades out below it instead of meeting a hard edge.
    <header className="sticky top-0 z-20 -mx-4 mb-4 -mt-[max(1.25rem,env(safe-area-inset-top))] bg-background px-4 pt-[calc(max(1.25rem,env(safe-area-inset-top))+0.25rem)] pb-3 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-8 after:bg-linear-to-b after:from-background after:to-transparent">
      {/* Action shares the title row so a long description can't push it down into the content. */}
      <div className="flex min-h-10 items-center justify-between gap-3">
        {leading && <div className="-me-1 shrink-0">{leading}</div>}
        <h1 className="min-w-0 flex-1 truncate text-[1.75rem] leading-tight font-bold tracking-tight">{title}</h1>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-3">{children}</div>}
    </header>
  )
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) => {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-10 text-center">
      <div className="mb-3 rounded-full bg-secondary p-3 text-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

const ErrorState = ({ error }: { error: Error }) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertTitle>خطا در خواندن اطلاعات</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  )
}

const ListSkeleton = ({ rows = 3 }: { rows?: number }) => {
  const { rowKeys } = useListSkeleton(rows)
  return (
    <div className="space-y-3" aria-busy="true" aria-label="در حال بارگذاری">
      {rowKeys.map((key) => (
        <Skeleton key={key} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  )
}

export { PageHeader, EmptyState, ErrorState, ListSkeleton }
