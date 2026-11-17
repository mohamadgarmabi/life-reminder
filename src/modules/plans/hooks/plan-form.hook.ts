import { revalidateLogic } from '@tanstack/react-form'
import type { FormEvent } from 'react'
import { useLiveQuery } from '#/modules/database/hooks/database.hook'
import { useAppForm } from '#/modules/shell/components/form-fields'
import { formatJalaliYear } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'
import { planRepo } from '#/modules/plans/apis/plans.api'
import { STATUS, STATUS_ORDER } from '#/modules/plans/utils/plans.constants'
import { planFormSchema } from '#/modules/plans/utils/plans.schema'
import type { PlanFormProps, PlanFormValues } from '#/modules/plans/types'

const usePlanForm = ({ initial, defaultYear, onSubmit }: PlanFormProps) => {
  const defaultValues: PlanFormValues = initial
    ? {
        title: initial.title,
        description: initial.description ?? '',
        year: initial.year,
        status: initial.status,
        tags: initial.tags,
      }
    : { title: '', description: '', year: defaultYear, status: 'planned', tags: [] }

  const form = useAppForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: planFormSchema },
    onSubmit: ({ value }) => onSubmit(planFormSchema.parse(value)),
  })

  const all = useLiveQuery(() => planRepo.list())
  const knownTags = [...new Set((all.data ?? []).flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b, 'fa'))
  // A few years around the default; an edited plan's own year is always offered.
  const years = [...new Set([...Array.from({ length: 7 }, (_, i) => defaultYear - 1 + i), defaultValues.year])].sort()

  return {
    form,
    knownTags,
    yearOptions: years.map((y) => ({ value: y, label: formatJalaliYear(y) })),
    statusOptions: STATUS_ORDER.map((s) => ({ value: s, label: STATUS[s].label })),
    submitLabel: initial ? t('plans.saveChanges') : t('plans.add'),
    handleSubmit: (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      void form.handleSubmit()
    },
  }
}

export { usePlanForm }
