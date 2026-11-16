import { CircleUserRound } from 'lucide-react'
import { Button } from '#/components/button'
import { useAccountCard } from '#/modules/account/hooks/account-card.hook'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { SettingsSection } from '#/modules/settings/components/settings-section'

const AccountCard = () => {
  const { isAvailable, isSignedIn, isWaiting, picture, title, description, handleSignIn, handleSignOut, handleCancel } =
    useAccountCard()

  if (!isAvailable) return null
  return (
    <SettingsSection title="حساب کاربری">
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
                خروج
              </Button>
            )}
            {isWaiting && (
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                لغو
              </Button>
            )}
            {!isSignedIn && !isWaiting && (
              <Button size="sm" onClick={handleSignIn}>
                ورود
              </Button>
            )}
          </>
        }
      />
    </SettingsSection>
  )
}

export { AccountCard }
