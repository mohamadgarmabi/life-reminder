import type { ReactNode } from 'react'
import { CloudRain, CloudSnow, Cloud, Gauge, Hand, Moon, Smartphone, Sun, SunMedium } from 'lucide-react'
import { z } from 'zod'
import { Button } from '#/components/button'
import { DIFFICULTIES, VEHICLES } from '#/modules/games/utils/traffic'
import { cn } from '#/modules/shell/utils/cn'
import { toFaDigits } from '#/modules/shell/utils/format'

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

const VEHICLE_LABEL: Record<(typeof VEHICLES)[number]['id'], string> = {
  hatch: 'هاچ‌بک مدرن',
  sedan: 'سدان',
  classic: 'سدان کلاسیک',
  pickup: 'وانت',
  truck: 'کامیون',
}
const WEATHER = [
  { value: 'normal', label: 'آفتابی', icon: Sun },
  { value: 'cloudy', label: 'ابری', icon: Cloud },
  { value: 'rain', label: 'بارانی', icon: CloudRain },
  { value: 'snow', label: 'برفی', icon: CloudSnow },
] as const
const DIFFICULTY_LABEL: Record<Setup['difficulty'], string> = {
  easy: 'آسان',
  medium: 'متوسط',
  hard: 'سخت',
  legendary: 'افسانه‌ای',
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
        <Section title="ماشین">
          <div className="flex flex-wrap gap-2 pb-1" role="radiogroup" aria-label="رنگ ماشین">
            {PAINT_CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={value.paint === c}
                aria-label={`رنگ ${c}`}
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
                  alt={VEHICLE_LABEL[v.id]}
                  className="aspect-[16/10] w-full object-contain"
                  draggable={false}
                />
                <span className="text-start font-semibold">{VEHICLE_LABEL[v.id]}</span>
                <span className="flex items-center gap-1.5 text-xs">
                  <Gauge className="size-3.5 shrink-0 opacity-70" aria-hidden />
                  <span className="opacity-70">حداکثر</span>
                  <span className="font-bold tabular-nums">{toFaDigits(v.topSpeed)}</span>
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
                  {toFaDigits(v.length.toFixed(1))} متر{v.id === 'truck' && ' · سنگین و پهن'}
                </span>
              </Choice>
            ))}
          </div>
        </Section>

        <Section title="زمان">
          <div className="grid grid-cols-2 gap-2">
            <Choice selected={!value.night} onClick={() => set('night', false)}>
              <SunMedium className="size-4" aria-hidden /> روز
            </Choice>
            <Choice selected={value.night} onClick={() => set('night', true)}>
              <Moon className="size-4" aria-hidden /> شب
            </Choice>
          </div>
        </Section>

        <Section title="آب‌وهوا">
          <div className="grid grid-cols-4 gap-2">
            {WEATHER.map(({ value: w, label, icon: Icon }) => (
              <Choice key={w} selected={value.weather === w} onClick={() => set('weather', w)} className="flex-col">
                <Icon className="size-5" aria-hidden />
                <span className="text-xs">{label}</span>
              </Choice>
            ))}
          </div>
          {(value.weather === 'rain' || value.weather === 'snow') && (
            <p className="text-xs text-amber-200/80">
              جادهٔ {value.weather === 'rain' ? 'خیس' : 'برفی'} لیز است: فرمان و ترمز کندتر جواب می‌دهند.
            </p>
          )}
        </Section>

        <Section title="سختی">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(DIFFICULTIES) as Setup['difficulty'][]).map((d) => (
              <Choice
                key={d}
                selected={value.difficulty === d}
                onClick={() => set('difficulty', d)}
                className="justify-between"
              >
                <span>{DIFFICULTY_LABEL[d]}</span>
                <span className="text-xs opacity-60">×{toFaDigits(DIFFICULTIES[d].multiplier)} امتیاز</span>
              </Choice>
            ))}
          </div>
        </Section>

        <Section title="کنترل فرمان">
          <div className="grid grid-cols-2 gap-2">
            <Choice selected={value.control === 'touch'} onClick={() => set('control', 'touch')} className="flex-col">
              <Hand className="size-5" aria-hidden />
              <span>دکمهٔ چپ و راست</span>
            </Choice>
            <Choice
              selected={value.control === 'tilt'}
              onClick={() => set('control', 'tilt')}
              disabled={!tilt}
              className="flex-col"
            >
              <Smartphone className="size-5" aria-hidden />
              <span>حسگر (کج کردن گوشی)</span>
            </Choice>
          </div>
          <p className="text-xs text-white/60">
            {value.control === 'tilt'
              ? 'گوشی را مثل فرمان به چپ و راست کج کن. حالتی که هنگام شروع نگه می‌داری «صاف» حساب می‌شود.'
              : 'انگشتت را روی نیمهٔ چپ یا راست صفحه نگه دار.'}
            {!tilt && ' این دستگاه حسگر حرکت ندارد.'}
          </p>
        </Section>

        <Button size="lg" className="h-14 bg-white text-base text-black hover:bg-white/90" onClick={onStart}>
          شروع رانندگی
        </Button>
      </div>
    </div>
  )
}

export { TrafficSetup, setupSchema, DEFAULT_SETUP }
export type { Setup }
