import { Link } from '@tanstack/react-router'
import { DatabaseZap } from 'lucide-react'
import { EmptyState } from '#/modules/shell/components/states'
import { Button } from '#/modules/shell/components/ui/button'

const NotFoundView = () => {
  return (
    <EmptyState
      icon={DatabaseZap}
      title="صفحه پیدا نشد"
      description="آدرسی که باز کرده‌اید وجود ندارد."
      action={
        <Button asChild>
          <Link to="/">بازگشت به خانه</Link>
        </Button>
      }
    />
  )
}

export default NotFoundView
