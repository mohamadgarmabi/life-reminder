import { useEffect, useRef } from 'react'
import type { DayButton } from '@daypicker/react'

type DayModifiers = React.ComponentProps<typeof DayButton>['modifiers']

const useCalendarDayButton = (modifiers: DayModifiers) => {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])
  return {
    ref,
    selectedSingle: modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
  }
}

export { useCalendarDayButton }
