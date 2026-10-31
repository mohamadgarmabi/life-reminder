import { useSelector } from "@tanstack/react-store"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { settingsStore } from "#/stores/settings.store"

const FONT = "'Vazirmatn Variable', -apple-system, system-ui, sans-serif"

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useSelector(settingsStore, (s) => s.theme)

  return (
    <Sonner
      theme={theme}
      dir="rtl"
      position="top-center"
      className="toaster group"
      // sonner sets its own system font on the toaster, so "inherit" would not reach Vazirmatn.
      toastOptions={{ style: { fontFamily: FONT, fontSize: "0.875rem", boxShadow: "0 0 0 0.5px var(--border), 0 8px 24px -6px rgb(0 0 0 / 0.2)" } }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          fontFamily: FONT,
          // Solid, not translucent: page text showing through made toasts unreadable.
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
