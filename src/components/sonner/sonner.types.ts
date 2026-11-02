type ToastKind = 'success' | 'error' | 'info'

interface ToastOptions {
  action?: { label: string; onClick: () => void }
}

interface GlassToastProps extends ToastOptions {
  id: string | number
  kind: ToastKind
  message: string
}

export type { GlassToastProps, ToastKind, ToastOptions }
