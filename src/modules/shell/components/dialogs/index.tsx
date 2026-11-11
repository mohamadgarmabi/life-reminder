import type { ReactNode } from 'react'
import { Button } from '#/components/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '#/components/drawer'
import { useFormDialog } from '#/modules/shell/hooks/dialogs.hook'

const FormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}) => {
  const { descriptionClassName, descriptionText } = useFormDialog({ title, description })
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className={descriptionClassName}>{descriptionText}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'حذف',
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-2 px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { FormDialog, ConfirmDialog }
