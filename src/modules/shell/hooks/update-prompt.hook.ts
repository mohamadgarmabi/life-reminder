import { useEffect, useState } from 'react'
import { toast } from '#/components/sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { z } from 'zod'
import { toLocalDigits } from '#/modules/shell/utils/format'
import { notesSince, type ReleaseNote } from '#/modules/shell/utils/release-notes'
import { t } from '#/modules/shell/utils/i18n'

const versionSchema = z.object({
  version: z.string(),
  commits: z.array(z.object({ sha: z.string(), subject: z.string(), body: z.string().default('') })),
})

const useUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()
  const [info, setInfo] = useState<{ version: string; notes: ReleaseNote[] } | null>(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (!offlineReady) return
    toast.success(t('shell.update.offlineReady'))
    setOfflineReady(false)
  }, [offlineReady, setOfflineReady])

  useEffect(() => {
    if (!needRefresh) return
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const parsed = versionSchema.safeParse(json)
        if (!cancelled && parsed.success)
          setInfo({ version: parsed.data.version, notes: notesSince(parsed.data.commits, __APP_COMMIT__) })
      })
      .catch(() => undefined) // offline: the sheet still offers the update, just without notes
    return () => {
      cancelled = true
    }
  }, [needRefresh])

  return {
    open: needRefresh,
    versionLabel: info
      ? t('shell.update.version', { version: toLocalDigits(info.version) })
      : t('shell.update.newVersion'),
    notes: info?.notes ?? [],
    hasNotes: !!info?.notes.length,
    applying,
    handleOpenChange: (o: boolean) => {
      if (!o) setNeedRefresh(false)
    },
    handleApply: () => {
      setApplying(true)
      void updateServiceWorker(true)
    },
  }
}

export { useUpdatePrompt }
