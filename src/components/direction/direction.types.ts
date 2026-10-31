import type * as React from 'react'
import type { Direction } from 'radix-ui'

type DirectionProviderProps = React.ComponentProps<typeof Direction.DirectionProvider> & {
  direction?: React.ComponentProps<typeof Direction.DirectionProvider>['dir']
}

export type { DirectionProviderProps }
