import { LogOut, Mail, UserPlus, Users, X } from 'lucide-react'
import { Button } from '#/components/button'
import { Input } from '#/components/input'
import { useFamilyCard } from '#/modules/account/hooks/family-card.hook'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { ConfirmDialog } from '#/modules/shell/components/dialogs'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'

/** Family sharing: everyone in a family sees and edits the same data. */
const FamilyCard = () => {
  const {
    isVisible,
    isLoading,
    error,
    members,
    received,
    sent,
    canLeave,
    email,
    busy,
    handleEmailChange,
    handleInvite,
    handleLeave,
    isConfirmOpen,
    confirmTitle,
    confirmDescription,
    confirmLabel,
    handleConfirmOpenChange,
    handleConfirm,
  } = useFamilyCard()
  const { t } = useI18n()

  if (!isVisible) return null
  return (
    <SettingsSection title={t('account.family.title')} description={t('account.family.description')}>
      {isLoading && <p className="px-4 py-3 text-sm text-muted-foreground">{t('account.family.loading')}</p>}
      {error && <p className="px-4 py-3 text-sm text-destructive">{error}</p>}
      {received.map((r) => (
        <SettingsRow
          key={r.key}
          icon={Mail}
          tone="bg-amber-500"
          title={r.label}
          trailing={
            <Button size="sm" onClick={r.onAccept} disabled={busy}>
              {t('account.family.accept')}
            </Button>
          }
        />
      ))}
      {members.map((m) => (
        <SettingsRow key={m.email} icon={Users} tone="bg-indigo-500" title={m.label} />
      ))}
      {sent.map((s) => (
        <SettingsRow
          key={s.email}
          icon={UserPlus}
          tone="bg-gray-400"
          title={s.email}
          description={t('account.family.pending')}
          trailing={
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={s.onCancel}
              disabled={busy}
              aria-label={t('account.family.cancelInvite')}
            >
              <X />
            </Button>
          }
        />
      ))}
      <form noValidate onSubmit={handleInvite} className="flex gap-2 px-4 py-3">
        <Input
          type="email"
          inputMode="email"
          autoComplete="off"
          dir="ltr"
          placeholder="name@gmail.com"
          aria-label={t('account.family.emailLabel')}
          value={email}
          onChange={handleEmailChange}
        />
        <Button type="submit" disabled={busy}>
          <UserPlus />
          {t('account.family.invite')}
        </Button>
      </form>
      {canLeave && (
        <SettingsRow
          icon={LogOut}
          tone="bg-red-500"
          title={t('account.family.leave')}
          onClick={handleLeave}
          destructive
        />
      )}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={handleConfirmOpenChange}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        onConfirm={handleConfirm}
      />
    </SettingsSection>
  )
}

export { FamilyCard }
