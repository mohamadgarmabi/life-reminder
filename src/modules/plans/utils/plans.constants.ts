import type { PlanStatus } from '#/modules/plans/types'
import { t } from '#/modules/shell/utils/i18n'
import type { MessageKey } from '#/modules/shell/utils/i18n'

type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline'

// `label` is a getter so it translates at read time, never at module load.
const status = (key: MessageKey, variant: StatusVariant) =>
  Object.defineProperty({ variant }, 'label', { get: () => t(key), enumerable: true }) as {
    label: string
    variant: StatusVariant
  }

const STATUS: Record<PlanStatus, { label: string; variant: StatusVariant }> = {
  'in-progress': status('plans.statusInProgress', 'default'),
  planned: status('plans.statusPlanned', 'outline'),
  done: status('plans.statusDone', 'secondary'),
  skipped: status('plans.statusSkipped', 'secondary'),
}

/** Display / sort order: what needs attention first. */
const STATUS_ORDER: PlanStatus[] = ['in-progress', 'planned', 'done', 'skipped']

export { STATUS, STATUS_ORDER }
