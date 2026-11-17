import { CircleUserRound } from 'lucide-react'
import { Button } from '#/components/button'
import { useAccountCard } from '#/modules/account/hooks/account-card.hook'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'

const AccountCard = () => {
  const { isAvailable, isSignedIn, isWaiting, picture, title, description, handleSignIn, handleSignOut, handleCancel } =
    useAccountCard()
  const { t } = useI18n()

  if (!isAvailable) return null
  return (
    <SettingsSection title={t('account.title')}>
      <SettingsRow
        icon={CircleUserRound}
        tone="bg-blue-500"
        title={title}
        description={description}
        trailing={
          <>
            {picture && (
              <img src={picture} alt="" referrerPolicy="no-referrer" className="size-8 shrink-0 rounded-full" />
            )}
            {isSignedIn && (
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                {t('account.signOut')}
              </Button>
            )}
            {isWaiting && (
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                {t('account.cancel')}
              </Button>
            )}
            {!isSignedIn && !isWaiting && (
              <Button size="sm" onClick={handleSignIn}>
                {t('account.signIn')}
              </Button>
            )}
          </>
        }
      />
    </SettingsSection>
  )
}

export { AccountCard }
