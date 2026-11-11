import { useRef, useState } from 'react'

const useActionSheet = () => {
  const [open, setOpen] = useState(false)
  const pending = useRef<(() => void) | null>(null)

  // Run the action after the sheet finishes closing, so an action that opens another drawer doesn't fight this one.
  const handleSelect = (action: () => void) => {
    pending.current = action
    setOpen(false)
  }

  const handleAnimationEnd = (isOpen: boolean) => {
    if (isOpen || !pending.current) return
    const action = pending.current
    pending.current = null
    action()
  }

  return { open, setOpen, handleSelect, handleAnimationEnd }
}

export { useActionSheet }
