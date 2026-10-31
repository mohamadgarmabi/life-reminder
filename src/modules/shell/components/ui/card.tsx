import * as React from 'react'
import { cn } from '#/modules/shell/utils/cn'

const Card = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-transparent glass py-4 text-card-foreground',
        className,
      )}
      {...props}
    />
  )
}

const CardHeader = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

const CardTitle = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div data-slot="card-title" className={cn('leading-none font-semibold', className)} {...props} />
}

const CardDescription = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div data-slot="card-description" className={cn('text-sm text-muted-foreground', className)} {...props} />
}

const CardAction = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

const CardContent = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div data-slot="card-content" className={cn('px-4', className)} {...props} />
}

const CardFooter = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return <div data-slot="card-footer" className={cn('flex items-center px-4 [.border-t]:pt-6', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter }
