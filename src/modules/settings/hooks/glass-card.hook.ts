import { useSelector } from '@tanstack/react-store'
import { useState, type ChangeEvent } from 'react'
import { MATERIAL_PRESETS } from 'simple-liquid-glass'
import { DEFAULT_GLASS, settingsStore, updateSettings } from '#/modules/settings/stores/settings.store'
import type { GlassControlKey, GlassMaterial } from '#/modules/settings/types'
import { GLASS_MATERIAL_OPTIONS } from '#/modules/settings/utils/settings.constants'

/** simple-liquid-glass defaults for props a material preset leaves unset. */
const LIBRARY_DEFAULTS: Partial<Record<GlassControlKey, number>> = {
  blur: 0,
  saturation: 140,
  scale: 160,
  aberrationIntensity: 0,
  frost: 0.1,
}

const useGlassCard = () => {
  const [open, setOpen] = useState(false)
  const glass = useSelector(settingsStore, (s) => s.glass)
  const preset: Partial<Record<string, unknown>> = MATERIAL_PRESETS[glass.material]

  /** What the slider shows: your value, else the material's, else the library's. */
  const valueOf = (key: GlassControlKey) =>
    glass[key] ?? (preset[key] as number | undefined) ?? LIBRARY_DEFAULTS[key] ?? 0

  // A new material starts from its own preset; tint and rim are kept.
  const handleMaterialChange = (material: string) =>
    updateSettings({ glass: { material: material as GlassMaterial, tint: glass.tint, rim: glass.rim } })

  const handleChange = (key: GlassControlKey) => (e: ChangeEvent<HTMLInputElement>) =>
    updateSettings({ glass: { ...settingsStore.state.glass, [key]: Number(e.target.value) } })

  const handleReset = () => updateSettings({ glass: DEFAULT_GLASS })

  return {
    open,
    setOpen,
    material: glass.material,
    materialLabel: GLASS_MATERIAL_OPTIONS.find((o) => o.value === glass.material)?.label,
    valueOf,
    handleMaterialChange,
    handleChange,
    handleReset,
  }
}

export { useGlassCard }
