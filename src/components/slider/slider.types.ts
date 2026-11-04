import type * as React from 'react'
import type { Slider as SliderPrimitive } from 'radix-ui'

type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Accessible name of the thumb (the focusable slider). */
  label: string
}

export type { SliderProps }
