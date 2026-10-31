import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useToaster } from './sonner.hook'
import { toasterVariants, toastIconVariants, toastStyle, toasterStyle } from './sonner.styles'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useToaster()

  return (
    <Sonner
      theme={theme}
      dir="rtl"
      position="top-center"
      className={toasterVariants()}
      toastOptions={{ style: toastStyle }}
      icons={{
        success: <CircleCheckIcon className={toastIconVariants()} />,
        info: <InfoIcon className={toastIconVariants()} />,
        warning: <TriangleAlertIcon className={toastIconVariants()} />,
        error: <OctagonXIcon className={toastIconVariants()} />,
        loading: <Loader2Icon className={toastIconVariants({ spin: true })} />,
      }}
      style={toasterStyle}
      {...props}
    />
  )
}

export { Toaster }
