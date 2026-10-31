import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '#/modules/shell/components/ui/drawer'
import { useSelect } from '#/modules/shell/hooks/select.hook'
import type { SelectOption } from '#/modules/shell/types'
import { cn } from '#/modules/shell/utils/cn'

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption<string>[]
  /** Sheet title and the trigger's accessible name. */
  label: string
  id?: string
  disabled?: boolean
  className?: string
  /** Set when rendered inside another drawer (form sheets). */
  nested?: boolean
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

// Options open in a bottom sheet instead of a popover list.
const Select = ({ value, onValueChange, options, label, nested, className, ...triggerProps }: SelectProps) => {
  const { open, setOpen, currentLabel, items } = useSelect({ value, onValueChange, options })
  return (
    <>
      <button
        type="button"
        data-slot="select-trigger"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-10 w-fit items-center justify-between gap-2 rounded-lg border border-transparent bg-field px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
          className,
        )}
        {...triggerProps}
      >
        <span className="line-clamp-1">{currentLabel}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground opacity-50" aria-hidden />
      </button>
      <Drawer nested={nested} open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{label}</DrawerTitle>
          </DrawerHeader>
          {/* data-vaul-no-drag: long lists scroll instead of dragging the sheet */}
          <div
            data-vaul-no-drag
            className="overflow-y-auto overscroll-contain px-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            {items.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={o.selected}
                onClick={o.onSelect}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-start text-[0.9375rem] outline-none focus-visible:bg-accent active:bg-accent aria-pressed:font-semibold"
              >
                {o.label}
                {o.selected && <CheckIcon className="size-5 shrink-0" aria-hidden />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export { Select }
