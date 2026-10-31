import type * as React from 'react'
import type { Switch as SwitchPrimitive } from 'radix-ui'

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}

export type { SwitchProps }
