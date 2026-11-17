import { LayoutGrid, List } from 'lucide-react'
import { useViewMode, type ViewPage } from '#/modules/shell/hooks/view-toggle.hook'
import { cn } from '#/modules/shell/utils/cn'
import { t } from '#/modules/shell/utils/i18n'

const OPTIONS = [
  { value: 'list', label: 'shell.view.list', icon: List },
  { value: 'grid', label: 'shell.view.grid', icon: LayoutGrid },
] as const

/** Segmented list/grid switch for a page header. */
const ViewToggle = ({ page }: { page: ViewPage }) => {
  const { view, setView } = useViewMode(page)
  return (
    <div role="radiogroup" aria-label={t('shell.view.label')} className="flex rounded-full bg-card p-0.5">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={view === value}
          aria-label={t(label)}
          onClick={() => setView(value)}
          className={cn(
            'grid size-8 place-items-center rounded-full transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
            view === value ? 'bg-primary text-primary-foreground' : 'text-foreground/70',
          )}
        >
          <Icon className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  )
}

export { ViewToggle }
