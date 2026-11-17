import { Progress } from '#/components/progress'
import { toLocalDigits } from '#/modules/shell/utils/format'
import { t } from '#/modules/shell/utils/i18n'

/** Shown until save data, the physics engine and the world are all ready. */
const LoadingScreen = ({ title, progress }: { title: string; progress: number }) => (
  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-sky-950 to-teal-900 p-8 text-white">
    <p className="text-2xl font-bold">{title}</p>
    <Progress value={progress} className="h-2 max-w-60 bg-white/20" aria-label={t('adventure.loading')} />
    <p className="text-sm text-white/70 tabular-nums">
      {t('adventure.loadingProgress', { percent: toLocalDigits(Math.round(progress)) })}
    </p>
  </div>
)

export { LoadingScreen }
