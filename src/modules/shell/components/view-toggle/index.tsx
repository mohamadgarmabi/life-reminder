import { LayoutGrid, List } from 'lucide-react'
import { GlassLayer } from '#/components/glass'
import { useViewMode, type ViewPage } from '#/modules/shell/hooks/view-toggle.hook'
import { cn } from '#/modules/shell/utils/cn'

const OPTIONS = [
  { value: 'list', label: 'نمای فهرستی', icon: List },
  { value: 'grid', label: 'نمای شبکه‌ای', icon: LayoutGrid },
] as const

/** Segmented list/grid switch for a page header. */
const ViewToggle = ({ page }: { page: ViewPage }) => {
  const { view, setView } = useViewMode(page)
  return (
    <div role="radiogroup" aria-label="نوع نمایش" className="relative isolate flex rounded-full p-0.5">
      <GlassLayer radius={18} />
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={view === value}
          aria-label={label}
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
