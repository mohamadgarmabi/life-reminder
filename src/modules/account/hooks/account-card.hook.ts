import { useGoogleAccount } from '#/modules/account/hooks/google-account.hook'
import { t } from '#/modules/shell/utils/i18n'

const useAccountCard = () => {
  const { isAvailable, isSignedIn, isWaiting, account, error, signIn, signOut, cancelSignIn } = useGoogleAccount()
  return {
    isAvailable,
    isSignedIn,
    isWaiting,
    picture: account?.picture || null,
    title: isSignedIn ? account?.name || t('account.googleAccount') : t('account.signInWithGoogle'),
    description: isSignedIn
      ? account?.email || t('account.signedIn')
      : isWaiting
        ? t('account.waiting')
        : (error?.message ?? t('account.hint')),
    handleSignIn: signIn,
    handleSignOut: () => void signOut(),
    handleCancel: cancelSignIn,
  }
}

export { useAccountCard }
