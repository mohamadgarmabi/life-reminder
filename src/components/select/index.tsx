import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '#/components/drawer'
import { useSelect } from './select.hook'
import { cn } from '#/modules/shell/utils/cn'
import {
  selectTriggerVariants,
  selectValueVariants,
  selectChevronVariants,
  selectOptionsVariants,
  selectOptionVariants,
  selectCheckVariants,
} from './select.styles'
import type { SelectProps } from './select.types'

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
        className={cn(selectTriggerVariants(), className)}
        {...triggerProps}
      >
        <span className={selectValueVariants()}>{currentLabel}</span>
        <ChevronDownIcon className={selectChevronVariants()} aria-hidden />
      </button>
      <Drawer nested={nested} open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{label}</DrawerTitle>
          </DrawerHeader>
          {/* data-vaul-no-drag: long lists scroll instead of dragging the sheet */}
          <div data-vaul-no-drag className={selectOptionsVariants()}>
            {items.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={o.selected}
                onClick={o.onSelect}
                className={selectOptionVariants()}
              >
                {o.label}
                {o.selected && <CheckIcon className={selectCheckVariants()} aria-hidden />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export { Select }
