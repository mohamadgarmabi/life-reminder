import { GlassLayer } from '#/components/glass'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '#/components/button'
import type { QuickActionProps } from '#/modules/dashboard/types'

const QuickAction = ({ to, icon: Icon, label }: QuickActionProps) => {
  return (
    <Button asChild variant="outline" className="isolate h-auto flex-col gap-1.5 rounded-2xl bg-transparent py-3 shadow-none">
      <Link to={to} search={{ new: true }}>
        <GlassLayer radius={16} />
        <span className="relative">
          <Icon className="size-5 text-primary" aria-hidden />
          <Plus
            className="absolute -inset-e-2 -bottom-1 size-3 rounded-full bg-primary text-primary-foreground"
            aria-hidden
          />
        </span>
        <span className="text-xs">{label} جدید</span>
      </Link>
    </Button>
  )
}

export { QuickAction }
