import { useGoogleAccount } from '#/modules/account/hooks/google-account.hook'

const useAccountCard = () => {
  const { isAvailable, isSignedIn, isWaiting, account, error, signIn, signOut, cancelSignIn } = useGoogleAccount()
  return {
    isAvailable,
    isSignedIn,
    isWaiting,
    picture: account?.picture || null,
    title: isSignedIn ? account?.name || 'حساب گوگل' : 'ورود با گوگل',
    description: isSignedIn
      ? account?.email || 'وارد شده‌اید'
      : isWaiting
        ? 'در انتظار ورود به حساب گوگل…'
        : (error?.message ?? 'برای نمایش تقویم گوگل در یادآورها؛ بدون حساب هم کار می‌کند.'),
    handleSignIn: signIn,
    handleSignOut: signOut,
    handleCancel: cancelSignIn,
  }
}

export { useAccountCard }
