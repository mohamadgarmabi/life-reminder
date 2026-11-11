import { Hand, X } from 'lucide-react'
import { useSelector } from '@tanstack/react-store'
import { Button } from '#/components/button'
import { settingsStore, updateSettings } from '#/modules/settings/stores/settings.store'

/** One-time tip that cards swipe; dismissed for good (kept in settings). */
const SwipeHint = () => {
  const seen = useSelector(settingsStore, (s) => s.swipeHintSeen)
  if (seen) return null
  return (
    <div className="mb-3 flex items-center gap-2 rounded-xl bg-muted/60 py-1.5 ps-3 pe-1 text-xs text-muted-foreground">
      <Hand className="size-4 shrink-0" aria-hidden />
      <p className="flex-1">کارت را به راست بکشید تا کارهای سریع را ببینید؛ همه‌چیز در منوی ⋮ هم هست.</p>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="بستن راهنما"
        onClick={() => updateSettings({ swipeHintSeen: true })}
      >
        <X />
      </Button>
    </div>
  )
}

export { SwipeHint }
