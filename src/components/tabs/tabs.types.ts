import type * as React from 'react'
import type { VariantProps } from 'class-variance-authority'
import type { Tabs as TabsPrimitive } from 'radix-ui'
import type { tabsListVariants } from './tabs.styles'

type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>

type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content>

export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps }
