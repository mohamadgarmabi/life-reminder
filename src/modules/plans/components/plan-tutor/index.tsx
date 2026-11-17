import { GraduationCap, Loader2, SendHorizontal, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription } from '#/components/alert'
import { Button } from '#/components/button'
import { Input } from '#/components/input'
import { usePlanTutor } from '#/modules/plans/hooks/plan-tutor.hook'
import type { Plan } from '#/modules/plans/types'
import { t } from '#/modules/shell/utils/i18n'

const PlanTutor = ({ plan }: { plan: Plan }) => {
  const {
    inputId,
    draft,
    error,
    isSending,
    isEmpty,
    canSend,
    intro,
    messages,
    starters,
    handleDraftChange,
    handleSubmit,
  } = usePlanTutor(plan)

  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <GraduationCap className="mt-0.5 size-4 shrink-0" aria-hidden /> {intro}
      </p>

      <div className="flex flex-col gap-2" aria-live="polite">
        {messages.map((m) => (
          <p key={m.key} className={m.className} dir="auto">
            {m.text}
          </p>
        ))}
        {isSending && (
          <p role="status" className="flex items-center gap-2 self-end text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> {t('plans.tutorWriting')}
          </p>
        )}
      </div>

      {isEmpty && (
        <div className="flex flex-wrap gap-2">
          {starters.map((s) => (
            <Button key={s.label} size="sm" variant="outline" onClick={s.onSelect}>
              {s.label}
            </Button>
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="sr-only">
          {t('plans.tutorMessage')}
        </label>
        <Input
          id={inputId}
          value={draft}
          onChange={handleDraftChange}
          placeholder={t('plans.tutorPlaceholder')}
          maxLength={2000}
          autoComplete="off"
        />
        <Button type="submit" size="icon" aria-label={t('plans.send')} disabled={!canSend}>
          <SendHorizontal className="rtl:rotate-180" />
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">{t('plans.aiDisclaimer')}</p>
    </div>
  )
}

export { PlanTutor }
