import { Link } from '@tanstack/react-router'
import { ChevronLeft, Loader2, Sparkles, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription } from '#/components/alert'
import { Button } from '#/components/button'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { useAnalysisCard } from '#/modules/settings/hooks/analysis-card.hook'

const AnalysisCard = () => {
  const { isAvailable, text, error, isAnalyzing, canAnalyze, buttonLabel, nearest, handleAnalyze } = useAnalysisCard()

  if (!isAvailable) return null
  return (
    <SettingsSection title="تحلیل هوشمند">
      <SettingsRow
        icon={Sparkles}
        tone="bg-violet-500"
        title="تحلیل وضعیت کلی"
        description="اقساط، دلار و طلا، برنامه‌ها، گیاهان و یادآورها؛ خلاصه‌ای از داده‌ها برای تحلیل فرستاده می‌شود."
        trailing={
          <Button size="sm" onClick={handleAnalyze} disabled={!canAnalyze}>
            {isAnalyzing && <Loader2 className="animate-spin" aria-hidden />} {buttonLabel}
          </Button>
        }
      >
        <div className="space-y-3" aria-live="polite">
          {nearest && (
            <Link
              to={nearest.to}
              className="flex items-center justify-between gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-medium"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">نزدیک‌ترین کار</span>
                <span className="block truncate">{nearest.label}</span>
              </span>
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
            </Link>
          )}
          {error && (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {text && (
            <>
              <p className="text-sm leading-7 whitespace-pre-line" dir="auto">
                {text}
              </p>
              <p className="text-xs text-muted-foreground">تحلیل هوش مصنوعی ممکن است خطا داشته باشد.</p>
            </>
          )}
        </div>
      </SettingsRow>
    </SettingsSection>
  )
}

export { AnalysisCard }
