import type * as React from 'react'
import type { Drawer as DrawerPrimitive } from 'vaul'

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root>

type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Content>

type DrawerHeaderProps = React.ComponentProps<'div'>

type DrawerTitleProps = React.ComponentProps<typeof DrawerPrimitive.Title>

type DrawerDescriptionProps = React.ComponentProps<typeof DrawerPrimitive.Description>

export type { DrawerProps, DrawerContentProps, DrawerHeaderProps, DrawerTitleProps, DrawerDescriptionProps }
