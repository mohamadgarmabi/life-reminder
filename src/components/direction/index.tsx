import { Direction } from 'radix-ui'
import type { DirectionProviderProps } from './direction.types'

const DirectionProvider = ({ dir, direction, children }: DirectionProviderProps) => {
  return <Direction.DirectionProvider dir={direction ?? dir}>{children}</Direction.DirectionProvider>
}

const useDirection = Direction.useDirection

export { DirectionProvider, useDirection }
