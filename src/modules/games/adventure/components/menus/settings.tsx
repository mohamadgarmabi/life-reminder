import type { ReactNode } from 'react'
import { Button } from '#/components/button'
import { Slider } from '#/components/slider'
import { Switch } from '#/components/switch'
import { Select } from '#/components/select'
import { useEngine, useGame, patchGame } from '#/modules/games/adventure/stores/session.store'
import { updateSettings } from '#/modules/games/adventure/stores/engine.actions'
import type { Quality } from '#/modules/games/adventure/types'
import { Panel } from '#/modules/games/adventure/components/menus/panel'

const QUALITY_OPTIONS: { value: Quality; label: string }[] = [
  { value: 'auto', label: 'خودکار' },
  { value: 'low', label: 'کم' },
  { value: 'high', label: 'زیاد' },
]

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-start text-sm font-medium">
    {label}
    {children}
  </label>
)

const SwitchRow = ({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) => (
  <label className="flex min-h-11 items-center justify-between gap-3 text-start text-sm font-medium">
    {label}
    <Switch checked={checked} onCheckedChange={onChange} />
  </label>
)

const SettingsPanel = ({ onClose }: { onClose: () => void }) => {
  const engine = useEngine()
  const s = useGame((g) => g.settings)
  const set = (patch: Parameters<typeof updateSettings>[1]) => updateSettings(engine, patch)

  return (
    <Panel title="تنظیمات">
      <Row label="موسیقی و صدای محیط">
        <Slider
          label="موسیقی و صدای محیط"
          min={0}
          max={1}
          step={0.05}
          value={[s.musicVolume]}
          onValueChange={([v]) => set({ musicVolume: v })}
        />
      </Row>
      <Row label="جلوه‌های صوتی">
        <Slider
          label="جلوه‌های صوتی"
          min={0}
          max={1}
          step={0.05}
          value={[s.sfxVolume]}
          onValueChange={([v]) => set({ sfxVolume: v })}
        />
      </Row>
      <Row label="حساسیت چرخش دوربین">
        <Slider
          label="حساسیت چرخش دوربین"
          min={0.5}
          max={2}
          step={0.1}
          value={[s.lookSensitivity]}
          onValueChange={([v]) => set({ lookSensitivity: v })}
        />
      </Row>
      <SwitchRow label="معکوس کردن بالا و پایین" checked={s.invertY} onChange={(v) => set({ invertY: v })} />
      <SwitchRow
        label="چپ‌دست (جای دسته و دوربین عوض شود)"
        checked={s.leftHanded}
        onChange={(v) => set({ leftHanded: v })}
      />
      <Row label="کیفیت گرافیک">
        <Select
          label="کیفیت گرافیک"
          value={s.quality}
          options={QUALITY_OPTIONS}
          onValueChange={(v) => set({ quality: v as Quality })}
        />
      </Row>
      <Button
        variant="secondary"
        onClick={() => {
          set({ hintSeen: false })
          patchGame(engine.store, { notice: 'راهنمای کنترل‌ها دفعهٔ بعد نشان داده می‌شود' })
        }}
      >
        نمایش دوبارهٔ راهنمای کنترل‌ها
      </Button>
      <Button size="lg" className="h-12" onClick={onClose}>
        بازگشت
      </Button>
    </Panel>
  )
}

export { SettingsPanel }
