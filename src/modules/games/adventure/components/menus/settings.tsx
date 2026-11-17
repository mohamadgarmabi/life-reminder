import type { ReactNode } from 'react'
import { Button } from '#/components/button'
import { Slider } from '#/components/slider'
import { Switch } from '#/components/switch'
import { Select } from '#/components/select'
import { useEngine, useGame, patchGame } from '#/modules/games/adventure/stores/session.store'
import { updateSettings } from '#/modules/games/adventure/stores/engine.actions'
import type { Quality } from '#/modules/games/adventure/types'
import { Panel } from '#/modules/games/adventure/components/menus/panel'
import { t } from '#/modules/shell/utils/i18n'

const QUALITIES: Quality[] = ['auto', 'low', 'high']
const qualityOptions = () => QUALITIES.map((value) => ({ value, label: t(`adventure.settings.quality.${value}`) }))

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
    <Panel title={t('adventure.settings')}>
      <Row label={t('adventure.settings.music')}>
        <Slider
          label={t('adventure.settings.music')}
          min={0}
          max={1}
          step={0.05}
          value={[s.musicVolume]}
          onValueChange={([v]) => set({ musicVolume: v })}
        />
      </Row>
      <Row label={t('adventure.settings.sfx')}>
        <Slider
          label={t('adventure.settings.sfx')}
          min={0}
          max={1}
          step={0.05}
          value={[s.sfxVolume]}
          onValueChange={([v]) => set({ sfxVolume: v })}
        />
      </Row>
      <Row label={t('adventure.settings.sensitivity')}>
        <Slider
          label={t('adventure.settings.sensitivity')}
          min={0.5}
          max={2}
          step={0.1}
          value={[s.lookSensitivity]}
          onValueChange={([v]) => set({ lookSensitivity: v })}
        />
      </Row>
      <SwitchRow label={t('adventure.settings.invertY')} checked={s.invertY} onChange={(v) => set({ invertY: v })} />
      <SwitchRow
        label={t('adventure.settings.leftHanded')}
        checked={s.leftHanded}
        onChange={(v) => set({ leftHanded: v })}
      />
      <Row label={t('adventure.settings.quality')}>
        <Select
          label={t('adventure.settings.quality')}
          value={s.quality}
          options={qualityOptions()}
          onValueChange={(v) => set({ quality: v as Quality })}
        />
      </Row>
      <Button
        variant="secondary"
        onClick={() => {
          set({ hintSeen: false })
          patchGame(engine.store, { notice: t('adventure.settings.guideNotice') })
        }}
      >
        {t('adventure.settings.showGuide')}
      </Button>
      <Button size="lg" className="h-12" onClick={onClose}>
        {t('adventure.back')}
      </Button>
    </Panel>
  )
}

export { SettingsPanel }
