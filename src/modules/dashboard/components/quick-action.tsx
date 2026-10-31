import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '#/components/button'
import type { QuickActionProps } from '#/modules/dashboard/types'

const QuickAction = ({ to, icon: Icon, label }: QuickActionProps) => {
  return (
    <Button asChild variant="outline" className="h-auto flex-col gap-1.5 rounded-2xl py-3">
      <Link to={to} search={{ new: true }}>
        <span className="relative">
          <Icon className="size-5 text-primary" aria-hidden />
          <Plus
            className="absolute -end-2 -bottom-1 size-3 rounded-full bg-primary text-primary-foreground"
            aria-hidden
          />
        </span>
        <span className="text-xs">{label} جدید</span>
      </Link>
    </Button>
  )
}

export { QuickAction }
