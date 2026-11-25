import { ErrorState, ListSkeleton } from '#/modules/shell/components/states'
import { useWateringHistory } from '#/modules/plants/hooks/watering-history.hook'
import type { WateringHistoryProps } from '#/modules/plants/types'
import { t } from '#/modules/shell/utils/i18n'
import { DrawerFooter } from '#/components/drawer'

const WateringHistory = (props: WateringHistoryProps) => {
  const { form, hasMisting, kindOptions, handleSubmit, isLoading, error, isEmpty, rows } = useWateringHistory(props)
  return (
    <div className="space-y-5">
      <form noValidate className="space-y-4 rounded-xl bg-accent/40 p-3" onSubmit={handleSubmit}>
        <p className="text-sm font-medium">{t('plants.logTitle')}</p>
        {hasMisting && (
          <form.AppField name="kind">
            {(f) => <f.SelectField label={t('plants.logKind')} options={kindOptions} />}
          </form.AppField>
        )}
        <form.AppField name="date">
          {(f) => <f.DateField label={t('plants.logDate')} description={t('plants.logDateHint')} />}
        </form.AppField>
        <DrawerFooter>
          <form.AppForm>
            <form.SubmitButton>{t('plants.logSubmit')}</form.SubmitButton>
          </form.AppForm>
        </DrawerFooter>
      </form>

      {isLoading && <ListSkeleton rows={2} />}
      {error && <ErrorState error={error} />}
      {isEmpty && <p className="py-6 text-center text-sm text-muted-foreground">{t('plants.historyEmpty')}</p>}
      <ul className="divide-y">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-3 py-3">
            <row.Icon className="size-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm">{row.dateLabel}</p>
              <p className="text-xs text-muted-foreground">{row.kindLabel}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{row.timeLabel}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { WateringHistory }
