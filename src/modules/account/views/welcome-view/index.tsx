import { Loader2 } from 'lucide-react'
import { Button } from '#/components/button'
import googleG from '#/modules/account/assets/images/google-g.svg'
import { useWelcome } from '#/modules/account/hooks/welcome.hook'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'

const WelcomeView = () => {
  const { features, canSignIn, isWaiting, signInLabel, iconSrc, handleSignIn, handleCancel, handleSkip } = useWelcome()
  const { t } = useI18n()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-between px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <img src={iconSrc} alt="" className="size-24 rounded-[1.75rem] shadow-[var(--material-shadow)]" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('account.welcome.appName')}</h1>
          <p className="text-sm text-muted-foreground">{t('account.welcome.tagline')}</p>
        </div>
        <ul className="grid w-full grid-cols-4 gap-2 pt-2">
          {features.map((f) => (
            <li key={f.label} className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-card text-foreground">
                <f.icon className="size-5" aria-hidden />
              </span>
              {f.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        {canSignIn && (
          <Button size="lg" className="w-full" onClick={handleSignIn} disabled={isWaiting}>
            {isWaiting && <Loader2 className="animate-spin" aria-hidden />}
            {!isWaiting && <img src={googleG} alt="" className="size-5" />}
            {signInLabel}
          </Button>
        )}
        {isWaiting && (
          <Button variant="ghost" size="sm" className="w-full" onClick={handleCancel}>
            {t('account.welcome.cancel')}
          </Button>
        )}
        <Button size="lg" variant="outline" className="w-full" onClick={handleSkip}>
          {t('account.welcome.skip')}
        </Button>
        {canSignIn && <p className="text-center text-xs text-muted-foreground">{t('account.welcome.calendarHint')}</p>}
      </div>
    </main>
  )
}

export default WelcomeView
