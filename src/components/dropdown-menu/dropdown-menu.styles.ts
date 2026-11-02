import { cva } from 'class-variance-authority'

const dropdownMenuContentVariants = cva([
  'z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto relative isolate rounded-2xl p-1.5 text-popover-foreground',
  'data-[side=bottom]:slide-in-from-top-2',
  'data-[side=left]:slide-in-from-right-2',
  'data-[side=right]:slide-in-from-left-2',
  'data-[side=top]:slide-in-from-bottom-2',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
])

const dropdownMenuItemVariants = cva([
  'relative flex cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-hidden select-none',
  'focus:bg-accent focus:text-accent-foreground',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  'data-[inset]:ps-8',
  'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive!',
  'dark:data-[variant=destructive]:focus:bg-destructive/20',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  "[&_svg:not([class*='size-'])]:size-4",
  "[&_svg:not([class*='text-'])]:text-muted-foreground",
])

const dropdownMenuToggleItemVariants = cva([
  'relative flex cursor-default items-center gap-2 rounded-xl py-1.5 pe-2 ps-8 text-sm outline-hidden select-none',
  'focus:bg-accent focus:text-accent-foreground',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  "[&_svg:not([class*='size-'])]:size-4",
])

const dropdownMenuItemIndicatorVariants = cva(
  'pointer-events-none absolute start-2 flex size-3.5 items-center justify-center',
)

const dropdownMenuCheckIconVariants = cva('size-4')

const dropdownMenuRadioIconVariants = cva('size-2 fill-current')

const dropdownMenuLabelVariants = cva('px-2 py-1.5 text-sm font-medium data-[inset]:ps-8')

const dropdownMenuSeparatorVariants = cva('-mx-1 my-1 h-px bg-border')

const dropdownMenuShortcutVariants = cva('ms-auto text-xs tracking-widest text-muted-foreground')

const dropdownMenuSubTriggerVariants = cva([
  'flex cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-hidden select-none',
  'focus:bg-accent focus:text-accent-foreground',
  'data-[inset]:ps-8',
  'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  "[&_svg:not([class*='size-'])]:size-4",
  "[&_svg:not([class*='text-'])]:text-muted-foreground",
])

const dropdownMenuSubTriggerIconVariants = cva('ms-auto size-4')

const dropdownMenuSubContentVariants = cva([
  'z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden relative isolate rounded-2xl p-1.5 text-popover-foreground',
  'data-[side=bottom]:slide-in-from-top-2',
  'data-[side=left]:slide-in-from-right-2',
  'data-[side=right]:slide-in-from-left-2',
  'data-[side=top]:slide-in-from-bottom-2',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
])

export {
  dropdownMenuContentVariants,
  dropdownMenuItemVariants,
  dropdownMenuToggleItemVariants,
  dropdownMenuItemIndicatorVariants,
  dropdownMenuCheckIconVariants,
  dropdownMenuRadioIconVariants,
  dropdownMenuLabelVariants,
  dropdownMenuSeparatorVariants,
  dropdownMenuShortcutVariants,
  dropdownMenuSubTriggerVariants,
  dropdownMenuSubTriggerIconVariants,
  dropdownMenuSubContentVariants,
}
