import type { PlanStatus } from '#/modules/plans/types'

const STATUS: Record<PlanStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'in-progress': { label: 'در حال انجام', variant: 'default' },
  planned: { label: 'برنامه‌ریزی‌شده', variant: 'outline' },
  done: { label: 'انجام شد', variant: 'secondary' },
  skipped: { label: 'رد شد', variant: 'secondary' },
}

/** Display / sort order: what needs attention first. */
const STATUS_ORDER: PlanStatus[] = ['in-progress', 'planned', 'done', 'skipped']

export { STATUS, STATUS_ORDER }
