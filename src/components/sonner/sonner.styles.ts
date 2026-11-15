import type { CSSProperties } from 'react'
import { cva } from 'class-variance-authority'

const FONT = "'Vazirmatn Variable', -apple-system, system-ui, sans-serif"

const toasterVariants = cva('toaster group')

const toastIconVariants = cva('size-4', {
  variants: { spin: { true: 'animate-spin' } },
})

// sonner sets its own system font on the toaster, so "inherit" would not reach Vazirmatn.
const toastStyle: CSSProperties = {
  fontFamily: FONT,
  fontSize: '0.875rem',
}

const toasterStyle = {
  fontFamily: FONT,
  // Toasts are glass cards (toast.tsx, thick glass keeps them legible); the wrapper adds no box of its own.
  '--normal-bg': 'transparent',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'transparent',
  '--border-radius': '1rem', // same 16px as the cards
} as CSSProperties

export { toasterVariants, toastIconVariants, toastStyle, toasterStyle }
