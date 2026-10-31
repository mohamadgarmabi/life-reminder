import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Button } from '#/modules/shell/components/ui/button'

const BackButton = ({ to, label }: { to: '/games' | '/settings'; label: string }) => {
  return (
    <Button variant="outline" asChild>
      <Link to={to}>
        <ChevronRight /> {label}
      </Link>
    </Button>
  )
}

export { BackButton }
