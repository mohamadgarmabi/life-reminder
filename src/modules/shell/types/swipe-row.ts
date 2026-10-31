import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent, ReactNode, RefObject } from 'react'
import type { MotionValue } from 'motion/react'

type SwipeAction = {
  id: string
  label: string
  icon?: ReactNode
  color?: string
  dismiss?: boolean
  onSelect?: () => void
}

type SwipeDirection = 'left' | 'right'

type SwipeRowPhase = 'idle' | 'committing' | 'collapsing'

type SwipeRowProps = {
  children?: ReactNode
  actions?: SwipeAction[]
  actionColor?: string
  drawerColor?: string
  rowColor?: string
  textColor?: string
  /** Row height in px; omitted = sized by its content. */
  height?: number
  radius?: number
  actionWidth?: number
  direction?: SwipeDirection
  snapBounce?: number
  resistance?: number
  collapseMs?: number
  commitAt?: number
  fullSwipe?: boolean
  disabled?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onAction?: (action: SwipeAction) => void
  onCommit?: (action: SwipeAction) => void
  closeOnAction?: boolean
  haptic?: boolean
  label?: string
  className?: string
  style?: CSSProperties
}

type SwipeRowActionView = {
  id: string
  label: string
  icon: ReactNode
  color: string
  textColor: string
  style: CSSProperties
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}

type SwipeRowModel = {
  children?: ReactNode
  rootRef: RefObject<HTMLDivElement | null>
  surfaceRef: RefObject<HTMLDivElement | null>
  rootClassName: string
  rootStyle: CSSProperties
  direction: SwipeDirection
  open: boolean
  phase: SwipeRowPhase
  disabled: boolean
  railId: string
  say: string
  label: string
  secondaryActions: SwipeRowActionView[]
  primaryAction: SwipeRowActionView | null
  surfaceXf: MotionValue<string>
  railXf: MotionValue<string>
  blockXf: MotionValue<string>
  glyphXf: MotionValue<string>
  handlePointerDown: (event: PointerEvent<HTMLDivElement>) => void
  handleToggleKey: (event: KeyboardEvent<HTMLButtonElement>) => void
  handleToggleClick: (event: MouseEvent<HTMLButtonElement>) => void
  actionsCount: number
  actionsNoun: string
}

export type { SwipeAction, SwipeDirection, SwipeRowActionView, SwipeRowModel, SwipeRowPhase, SwipeRowProps }
