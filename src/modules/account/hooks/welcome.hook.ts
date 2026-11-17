import { Bell, Flower2, Target, Wallet } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from '#/components/sonner'
import { useGoogleAccount } from '#/modules/account/hooks/google-account.hook'
import { updateSettings } from '#/modules/settings/stores/settings.store'
import { t } from '#/modules/shell/utils/i18n'
import type { MessageKey } from '#/modules/shell/utils/i18n'

const FEATURES: { icon: typeof Wallet; label: MessageKey }[] = [
  { icon: Wallet, label: 'account.welcome.installments' },
  { icon: Bell, label: 'account.welcome.reminders' },
  { icon: Flower2, label: 'account.welcome.plants' },
  { icon: Target, label: 'account.welcome.plans' },
]

const finish = () => updateSettings({ welcomeSeen: true })

const useWelcome = () => {
  const { isAvailable, isSignedIn, isWaiting, account, signIn, cancelSignIn } = useGoogleAccount()
  const name = account?.name

  // The sign-in finished in the other tab: enter the app.
  useEffect(() => {
    if (!isSignedIn) return
    finish()
    toast.success(name ? t('account.welcome.greeting', { name }) : t('account.welcome.signedIn'))
  }, [isSignedIn, name])

  return {
    features: FEATURES.map((f) => ({ icon: f.icon, label: t(f.label) })),
    canSignIn: isAvailable,
    isWaiting,
    signInLabel: isWaiting ? t('account.welcome.waiting') : t('account.signInWithGoogle'),
    iconSrc: `${import.meta.env.BASE_URL}pwa-192x192.png`,
    handleSignIn: signIn,
    handleCancel: cancelSignIn,
    handleSkip: finish,
  }
}

export { useWelcome }
