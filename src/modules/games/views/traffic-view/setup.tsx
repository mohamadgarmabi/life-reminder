import type { ReactNode } from 'react'
import { CloudRain, CloudSnow, Cloud, Gauge, Hand, Moon, Smartphone, Sun, SunMedium } from 'lucide-react'
import { z } from 'zod'
import { Button } from '#/components/button'
import { DIFFICULTIES, VEHICLES } from '#/modules/games/utils/traffic'
import { cn } from '#/modules/shell/utils/cn'
import { toLocalDigits } from '#/modules/shell/utils/format'
import { t, type MessageKey } from '#/modules/shell/utils/i18n'

/** Paints with pre-rendered picker photos (cars/thumbs/<id>-<hex>.webp). */
const PAINT_CHOICES = ['#a50f1c', '#f4f4f2', '#1c1d20', '#1f3a68', '#b9bcc0', '#2d4a3a', '#d98c00'] as const
const FASTEST = Math.max(...VEHICLES.map((v) => v.topSpeed))
const thumb = (id: string, paint: string) =>
  `${import.meta.env.BASE_URL}game-assets/traffic/cars/thumbs/${id}-${paint.slice(1)}.webp`

const setupSchema = z.object({
  vehicle: z
    .number()
    .int()
    .min(0)
    .max(VEHICLES.length - 1),
  paint: z.enum(PAINT_CHOICES),
  night: z.boolean(),
  weather: z.enum(['normal', 'cloudy', 'rain', 'snow']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'legendary']),
  control: z.enum(['tilt', 'touch']),
  // Added later: older saves without it still load.
  view: z.enum(['chase', 'cockpit']).default('chase'),
})
type Setup = z.infer<typeof setupSchema>

const DEFAULT_SETUP: Setup = {
  vehicle: 0,
  paint: '#a50f1c',
  night: false,
  weather: 'normal',
  difficulty: 'medium',
  control: 'touch',
  view: 'chase',
}

const VEHICLE_LABEL: Record<(typeof VEHICLES)[number]['id'], MessageKey> = {
  hatch: 'games.traffic.hatch',
  sedan: 'games.traffic.sedan',
  classic: 'games.traffic.classic',
  pickup: 'games.traffic.pickup',
  truck: 'games.traffic.truck',
}
const WEATHER = [
  { value: 'normal', label: 'games.traffic.sunny', icon: Sun },
  { value: 'cloudy', label: 'games.traffic.cloudy', icon: Cloud },
  { value: 'rain', label: 'games.traffic.rainy', icon: CloudRain },
  { value: 'snow', label: 'games.traffic.snowy', icon: CloudSnow },
] as const
const DIFFICULTY_LABEL: Record<Setup['difficulty'], MessageKey> = {
  easy: 'games.easy',
  medium: 'games.medium',
  hard: 'games.hard',
  legendary: 'games.traffic.legendary',
}

/** The device has a motion sensor API at all (actual readings are checked once the game runs). */
const canTilt = () => typeof window !== 'undefined' && 'DeviceOrientationEvent' in window

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-sm font-semibold text-white/70">{title}</h2>
    {children}
  </section>
)

const Choice = ({
  selected,
  onClick,
  disabled,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  disabled?: boolean
  children: ReactNode
  className?: string
}) => (
  <button
    type="button"
    aria-pressed={selected}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition outline-none focus-visible:ring-[3px] focus-visible:ring-white/50 disabled:opacity-40',
      selected ? 'border-white bg-white text-black' : 'border-white/20 bg-white/10 text-white hover:bg-white/15',
      className,
    )}
  >
    {children}
  </button>
)

/** Pre-race screen: car and colour, day/night, weather, difficulty and steering method. */
const TrafficSetup = ({
  value,
  onChange,
  onStart,
}: {
  value: Setup
  onChange: (next: Setup) => void
  onStart: () => void
}) => {
  const set = <K extends keyof Setup>(key: K, v: Setup[K]) => onChange({ ...value, [key]: v })
  const tilt = canTilt()

  return (
    <div className="absolute inset-0 overflow-y-auto bg-linear-to-b from-slate-900 via-slate-950 to-black text-white">
      <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-[calc(env(safe-area-inset-top)+4.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <Section title={t('games.traffic.car')}>
          <div className="flex flex-wrap gap-2 pb-1" role="radiogroup" aria-label={t('games.traffic.carColor')}>
            {PAINT_CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={value.paint === c}
                aria-label={t('games.traffic.color', { color: c })}
                onClick={() => set('paint', c)}
                className={cn(
                  'size-9 rounded-full border-2 outline-none focus-visible:ring-[3px] focus-visible:ring-white/50',
                  value.paint === c ? 'border-white ring-2 ring-white/40' : 'border-white/20',
                )}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {VEHICLES.map((v, i) => (
              <Choice
                key={v.id}
                selected={value.vehicle === i}
                onClick={() => set('vehicle', i)}
                className={cn('flex-col items-stretch gap-1 p-2', i === 0 && 'col-span-2')}
              >
                <img
                  src={thumb(v.id, value.paint)}
                  alt={t(VEHICLE_LABEL[v.id])}
                  className="aspect-[16/10] w-full object-contain"
                  draggable={false}
                />
                <span className="text-start font-semibold">{t(VEHICLE_LABEL[v.id])}</span>
                <span className="flex items-center gap-1.5 text-xs">
                  <Gauge className="size-3.5 shrink-0 opacity-70" aria-hidden />
                  <span className="opacity-70">{t('games.traffic.topSpeed')}</span>
                  <span className="font-bold tabular-nums">{toLocalDigits(v.topSpeed)}</span>
                  <span className="opacity-70">km/h</span>
                </span>
                {/* Top speed against the fastest car. */}
                <span className="h-1 overflow-hidden rounded-full bg-current/15" aria-hidden>
                  <span
                    className="block h-full rounded-full bg-current"
                    style={{ width: `${(v.topSpeed / FASTEST) * 100}%` }}
                  />
                </span>
                <span className="text-start text-[11px] opacity-60">
                  {t('games.traffic.length', { n: toLocalDigits(v.length.toFixed(1)) })}
                  {v.id === 'truck' && ` · ${t('games.traffic.heavy')}`}
                </span>
              </Choice>
            ))}
          </div>
        </Section>

        <Section title={t('games.traffic.time')}>
          <div className="grid grid-cols-2 gap-2">
            <Choice selected={!value.night} onClick={() => set('night', false)}>
              <SunMedium className="size-4" aria-hidden /> {t('games.traffic.day')}
            </Choice>
            <Choice selected={value.night} onClick={() => set('night', true)}>
              <Moon className="size-4" aria-hidden /> {t('games.traffic.night')}
            </Choice>
          </div>
        </Section>

        <Section title={t('games.traffic.weather')}>
          <div className="grid grid-cols-4 gap-2">
            {WEATHER.map(({ value: w, label, icon: Icon }) => (
              <Choice key={w} selected={value.weather === w} onClick={() => set('weather', w)} className="flex-col">
                <Icon className="size-5" aria-hidden />
                <span className="text-xs">{t(label)}</span>
              </Choice>
            ))}
          </div>
          {(value.weather === 'rain' || value.weather === 'snow') && (
            <p className="text-xs text-amber-200/80">
              {t(value.weather === 'rain' ? 'games.traffic.slipperyRain' : 'games.traffic.slipperySnow')}
            </p>
          )}
        </Section>

        <Section title={t('games.traffic.difficulty')}>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(DIFFICULTIES) as Setup['difficulty'][]).map((d) => (
              <Choice
                key={d}
                selected={value.difficulty === d}
                onClick={() => set('difficulty', d)}
                className="justify-between"
              >
                <span>{t(DIFFICULTY_LABEL[d])}</span>
                <span className="text-xs opacity-60">
                  {t('games.traffic.multiplier', { n: toLocalDigits(DIFFICULTIES[d].multiplier) })}
                </span>
              </Choice>
            ))}
          </div>
        </Section>

        <Section title={t('games.traffic.steering')}>
          <div className="grid grid-cols-2 gap-2">
            <Choice selected={value.control === 'touch'} onClick={() => set('control', 'touch')} className="flex-col">
              <Hand className="size-5" aria-hidden />
              <span>{t('games.traffic.buttons')}</span>
            </Choice>
            <Choice
              selected={value.control === 'tilt'}
              onClick={() => set('control', 'tilt')}
              disabled={!tilt}
              className="flex-col"
            >
              <Smartphone className="size-5" aria-hidden />
              <span>{t('games.traffic.tilt')}</span>
            </Choice>
          </div>
          <p className="text-xs text-white/60">
            {t(value.control === 'tilt' ? 'games.traffic.tiltHelp' : 'games.traffic.touchHelp')}
            {!tilt && ` ${t('games.traffic.noSensor')}`}
          </p>
        </Section>

        <Button size="lg" className="h-14 bg-white text-base text-black hover:bg-white/90" onClick={onStart}>
          {t('games.traffic.startDriving')}
        </Button>
      </div>
    </div>
  )
}

export { TrafficSetup, setupSchema, DEFAULT_SETUP }
export type { Setup }
