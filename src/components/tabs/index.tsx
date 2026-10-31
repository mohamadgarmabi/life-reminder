import { cn } from '#/modules/shell/utils/cn'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { tabsListVariants, tabsVariants, tabsTriggerVariants, tabsContentVariants } from './tabs.styles'
import type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from './tabs.types'

const Tabs = ({ className, orientation = 'horizontal', ...props }: TabsProps) => {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(tabsVariants(), className)}
      {...props}
    />
  )
}

const TabsList = ({ className, variant = 'default', ...props }: TabsListProps) => {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

const TabsTrigger = ({ className, ...props }: TabsTriggerProps) => {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn(tabsTriggerVariants(), className)} {...props} />
}

const TabsContent = ({ className, ...props }: TabsContentProps) => {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn(tabsContentVariants(), className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
