type ToastKind = 'success' | 'error' | 'info'

interface ToastOptions {
  action?: { label: string; onClick: () => void }
}

interface ToastCardProps extends ToastOptions {
  id: string | number
  kind: ToastKind
  message: string
}

export type { ToastCardProps, ToastKind, ToastOptions }
