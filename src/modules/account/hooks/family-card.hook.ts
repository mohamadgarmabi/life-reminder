import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from '@tanstack/react-store'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from '#/components/sonner'
import { acceptInvite, cancelInvite, fetchFamily, inviteToFamily, leaveFamily } from '#/modules/account/apis/family.api'
import { syncNow } from '#/modules/account/utils/sync-engine'
import { settingsStore } from '#/modules/settings/stores/settings.store'
import { t } from '#/modules/shell/utils/i18n'

type Confirm = { type: 'accept'; familyId: string; from: string } | { type: 'leave' } | null

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Invites aren't emailed (no mail service): the inviter sends the app link themselves.
 * Share sheet where available, otherwise the message is copied.
 */
const shareInvite = async (email: string) => {
  const url = new URL(import.meta.env.BASE_URL, location.origin).href
  const text = t('account.family.shareText', { email })
  if (navigator.share) {
    // Rejects when the user closes the sheet; nothing to do then.
    await navigator.share({ title: t('account.welcome.appName'), text, url }).catch(() => {})
    return
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`)
    toast.success(t('account.family.copied'))
  } catch {
    toast.info(`${text}\n${url}`)
  }
}

const useFamilyCard = () => {
  const session = useSelector(settingsStore, (s) => (s.welcomeSeen ? s.googleSession : null))
  const queryClient = useQueryClient()
  const q = useQuery({
    queryKey: ['family', session],
    queryFn: () => fetchFamily(session ?? ''),
    enabled: !!session,
    refetchOnWindowFocus: true,
  })
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<Confirm>(null)

  /** True when the task succeeded. */
  const run = async (task: () => Promise<unknown>, success: string, resync = false) => {
    if (!session) return false
    setBusy(true)
    try {
      await task()
      // Joined or left a family: this device's copy is rebuilt from the new family's data.
      if (resync) await syncNow()
      await queryClient.invalidateQueries({ queryKey: ['family'] })
      toast.success(success)
      return true
    } catch {
      toast.error(t('account.family.failed'))
      return false
    } finally {
      setBusy(false)
    }
  }

  const handleInvite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const target = email.trim().toLowerCase()
    if (!EMAIL.test(target)) return toast.error(t('account.family.invalidEmail'))
    if (target === q.data?.me) return toast.error(t('account.family.self'))
    void run(() => inviteToFamily(session ?? '', target), t('account.family.invited', { email: target })).then((ok) => {
      if (!ok) return
      setEmail('')
      void shareInvite(target)
    })
  }

  const handleConfirm = () => {
    if (confirm?.type === 'accept')
      void run(() => acceptInvite(session ?? '', confirm.familyId), t('account.family.joined'), true)
    if (confirm?.type === 'leave') void run(() => leaveFamily(session ?? ''), t('account.family.left'), true)
  }

  const data = q.data
  return {
    isVisible: !!session,
    isLoading: q.status === 'pending',
    error: q.error ? t('account.family.loadFailed') : null,
    members: (data?.members ?? []).map((m) => ({
      email: m,
      label: m === data?.me ? t('account.family.you', { email: m }) : m,
    })),
    received: (data?.received ?? []).map((r) => ({
      key: r.familyId,
      label: t('account.family.invitedBy', { email: r.from }),
      onAccept: () => setConfirm({ type: 'accept', familyId: r.familyId, from: r.from }),
    })),
    sent: (data?.sent ?? []).map((s) => ({
      email: s,
      onShare: () => void shareInvite(s),
      onCancel: () => void run(() => cancelInvite(session ?? '', s), t('account.family.cancelled')),
    })),
    canLeave: (data?.members.length ?? 0) > 1,
    email,
    busy,
    handleEmailChange: (e: { target: { value: string } }) => setEmail(e.target.value),
    handleInvite,
    handleLeave: () => setConfirm({ type: 'leave' }),
    isConfirmOpen: !!confirm,
    confirmTitle: confirm?.type === 'leave' ? t('account.family.leaveTitle') : t('account.family.acceptTitle'),
    confirmDescription:
      confirm?.type === 'leave'
        ? t('account.family.leaveDescription')
        : t('account.family.acceptDescription', { email: confirm?.from ?? '' }),
    confirmLabel: confirm?.type === 'leave' ? t('account.family.leave') : t('account.family.accept'),
    handleConfirmOpenChange: (open: boolean) => {
      if (!open) setConfirm(null)
    },
    handleConfirm,
  }
}

export { useFamilyCard }
