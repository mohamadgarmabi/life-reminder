import type * as React from 'react'
import type { Drawer as DrawerPrimitive } from 'vaul'

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root>

type DrawerSize = 'full' | 'lg' | 'md' | 'sm' | 'auto'

type DrawerContentProps = Omit<React.ComponentProps<typeof DrawerPrimitive.Content>, 'size'> & { size?: DrawerSize }

type DrawerHeaderProps = React.ComponentProps<'div'>

type DrawerTitleProps = React.ComponentProps<typeof DrawerPrimitive.Title>

type DrawerDescriptionProps = React.ComponentProps<typeof DrawerPrimitive.Description>

export type { DrawerProps, DrawerContentProps, DrawerSize, DrawerHeaderProps, DrawerTitleProps, DrawerDescriptionProps }
