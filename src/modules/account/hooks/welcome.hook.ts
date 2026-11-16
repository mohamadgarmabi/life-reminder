import { Bell, Flower2, Target, Wallet } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from '#/components/sonner'
import { useGoogleAccount } from '#/modules/account/hooks/google-account.hook'
import { updateSettings } from '#/modules/settings/stores/settings.store'

const FEATURES = [
  { icon: Wallet, label: 'اقساط' },
  { icon: Bell, label: 'یادآورها' },
  { icon: Flower2, label: 'گیاهان' },
  { icon: Target, label: 'برنامهٔ سال' },
]

const finish = () => updateSettings({ welcomeSeen: true })

const useWelcome = () => {
  const { isAvailable, isSignedIn, isWaiting, account, signIn, cancelSignIn } = useGoogleAccount()
  const name = account?.name

  // The sign-in finished in the other tab: enter the app.
  useEffect(() => {
    if (!isSignedIn) return
    finish()
    toast.success(name ? `خوش آمدید، ${name}` : 'با حساب گوگل وارد شدید.')
  }, [isSignedIn, name])

  return {
    features: FEATURES,
    canSignIn: isAvailable,
    isWaiting,
    signInLabel: isWaiting ? 'در انتظار ورود به گوگل…' : 'ورود با گوگل',
    iconSrc: `${import.meta.env.BASE_URL}pwa-192x192.png`,
    handleSignIn: signIn,
    handleCancel: cancelSignIn,
    handleSkip: finish,
  }
}

export { useWelcome }
