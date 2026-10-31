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
  boxShadow: '0 0 0 0.5px var(--border), 0 8px 24px -6px rgb(0 0 0 / 0.2)',
}

const toasterStyle = {
  fontFamily: FONT,
  // Solid, not translucent: page text showing through made toasts unreadable.
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
  '--border-radius': '1rem',
} as CSSProperties

export { toasterVariants, toastIconVariants, toastStyle, toasterStyle }
