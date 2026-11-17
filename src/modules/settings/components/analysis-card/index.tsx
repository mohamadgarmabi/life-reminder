import { Link } from '@tanstack/react-router'
import { ChevronLeft, Loader2, Sparkles, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription } from '#/components/alert'
import { Button } from '#/components/button'
import { SettingsSection } from '#/modules/settings/components/settings-section'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { useAnalysisCard } from '#/modules/settings/hooks/analysis-card.hook'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'

const AnalysisCard = () => {
  const { isAvailable, text, error, isAnalyzing, canAnalyze, buttonLabel, nearest, handleAnalyze } = useAnalysisCard()
  const { t } = useI18n()

  if (!isAvailable) return null
  return (
    <SettingsSection title={t('settings.analysis.title')}>
      <SettingsRow
        icon={Sparkles}
        tone="bg-violet-500"
        title={t('settings.analysis.row')}
        description={t('settings.analysis.description')}
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
                <span className="block text-xs text-muted-foreground">{t('settings.analysis.nearest')}</span>
                <span className="block truncate">{nearest.label}</span>
              </span>
              <ChevronLeft className="size-4 ltr:rotate-180 shrink-0" aria-hidden />
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
              <p className="text-xs text-muted-foreground">{t('settings.analysis.disclaimer')}</p>
            </>
          )}
        </div>
      </SettingsRow>
    </SettingsSection>
  )
}

export { AnalysisCard }
