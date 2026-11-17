import { Link } from '@tanstack/react-router'
import { DatabaseZap } from 'lucide-react'
import { EmptyState } from '#/modules/shell/components/states'
import { Button } from '#/components/button'
import { t } from '#/modules/shell/utils/i18n'

const NotFoundView = () => {
  return (
    <EmptyState
      icon={DatabaseZap}
      title={t('shell.notFound.title')}
      description={t('shell.notFound.description')}
      action={
        <Button asChild>
          <Link to="/">{t('shell.notFound.home')}</Link>
        </Button>
      }
    />
  )
}

export default NotFoundView
