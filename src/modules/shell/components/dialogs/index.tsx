import type { ReactNode } from 'react'
import { Button } from '#/components/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '#/components/drawer'
import type { DrawerSize } from '#/components/drawer'
import { useFormDialog } from '#/modules/shell/hooks/dialogs.hook'
import { t } from '#/modules/shell/utils/i18n'

const FormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'auto',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  size?: DrawerSize
}) => {
  const { descriptionClassName, descriptionText } = useFormDialog({ title, description })
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size={size}>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className={descriptionClassName}>{descriptionText}</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 min-w-0 w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-28">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
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
        <DrawerFooter className="grid gap-2">
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            glass={true}
            glassMaterial='clear'
          >
            {confirmLabel ?? t('common.delete')}
          </Button>
          <Button variant="outline" glass={true}
            glassMaterial='clear' onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export { FormDialog, ConfirmDialog }
