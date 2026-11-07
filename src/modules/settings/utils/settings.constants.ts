import type { PermissionStatus } from '#/modules/notifications/types'
import type { GlassControl, GlassControlKey, GlassMaterial } from '#/modules/settings/types'
import type { SelectOption } from '#/modules/shell/types'

const PERMISSION_LABEL: Record<PermissionStatus, string> = {
  granted: 'مجاز',
  denied: 'مسدود',
  default: 'درخواست نشده',
  unsupported: 'پشتیبانی نمی‌شود',
}

const GLASS_MATERIAL_OPTIONS: SelectOption<GlassMaterial>[] = [
  { value: 'frosted', label: 'مات' },
  { value: 'clear', label: 'شفاف' },
  { value: 'subtle', label: 'ملایم' },
  { value: 'smoked', label: 'دودی' },
]

/**
 * App defaults on top of the library presets. 'clear' ships with no blur or frost, which over the flat page
 * background renders as a plain tinted box, so it gets a light frost and blur to still read as glass.
 */
const GLASS_MATERIAL_DEFAULTS: Partial<Record<GlassMaterial, Partial<Record<GlassControlKey, number>>>> = {
  clear: { blur: 4, frost: 0.12 },
}

// simple-liquid-glass props and their useful ranges.
const GLASS_CONTROLS: GlassControl[] = [
  { key: 'blur', label: 'محوی', min: 0, max: 20, step: 1 },
  { key: 'scale', label: 'شکست نور', min: 0, max: 300, step: 10 },
  { key: 'aberrationIntensity', label: 'پاشش رنگ', min: 0, max: 1, step: 0.01 },
  { key: 'saturation', label: 'اشباع رنگ', min: 50, max: 200, step: 5 },
  { key: 'frost', label: 'برفکی', min: 0, max: 1, step: 0.01 },
  { key: 'tint', label: 'رنگ شیشه', min: 0, max: 1, step: 0.01 },
  { key: 'rim', label: 'نور لبه', min: 0, max: 1, step: 0.01 },
]

export { PERMISSION_LABEL, GLASS_MATERIAL_OPTIONS, GLASS_MATERIAL_DEFAULTS, GLASS_CONTROLS }
