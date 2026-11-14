import { useState } from 'react'

// vaul's close animation (TRANSITIONS.DURATION). Its onAnimationEnd only fires when vaul closes the drawer itself, not when we set open=false.
const CLOSE_MS = 500

const useActionSheet = () => {
  const [open, setOpen] = useState(false)

  // Run the action after the sheet finishes closing, so an action that opens another drawer doesn't fight this one.
  const handleSelect = (action: () => void) => {
    setOpen(false)
    setTimeout(action, CLOSE_MS)
  }

  return { open, setOpen, handleSelect }
}

export { useActionSheet }
