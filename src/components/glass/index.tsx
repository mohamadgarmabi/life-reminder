import { useSelector } from '@tanstack/react-store'
import { useContext } from 'react'
import { LiquidGlass } from 'simple-liquid-glass'
import { settingsStore } from '#/modules/settings/stores/settings.store'
import { cn } from '#/modules/shell/utils/cn'
import { GlassBackdropContext, useGlassMode, useIsTouch } from './glass.hook'
import type { GlassLayerProps } from './glass.types'

// Tint/rim colours per theme; their opacities come from Settings → liquid glass.
const TINT_RGB = {
  surface: { light: '255,255,255', dark: '44,44,46' },
  page: { light: '242,242,247', dark: '0,0,0' }, // --background
}
/** Dark surfaces need a much fainter rim than light ones. */
const RIM_SCALE = { light: 1, dark: 0.2 }
const THICK_TINT = 0.85
const THICK_BLUR = 20
const PAGE_OPTICS = {
  frost: 0,
  saturation: 100,
  aberrationIntensity: 0,
  lensOptions: { specular: 0, glow: 0, brightness: 0 },
} as const
const LAYER_STYLE = { position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' } as const

/**
 * Liquid-glass background for a surface (simple-liquid-glass). Put it as the first child of a
 * `relative isolate` element with a transparent background; `radius` must match the element's corners.
 * `thick`: sheets, dialogs and menus keep a floor of tint and blur so the page behind never competes with their text.
 */
const GlassLayer = ({ radius, thick = false, soft = false, tone = 'surface', className }: GlassLayerProps) => {
  const mode = useGlassMode()
  const touch = useIsTouch()
  const backdrop = useContext(GlassBackdropContext)
  // Floating bars and overlays refract the live page content under them; in-page surfaces the plain backdrop.
  const floating = thick || soft || tone === 'page'
  const enabled = useSelector(settingsStore, (s) => s.glassEnabled)
  const { material, tint, rim, ...optics } = useSelector(settingsStore, (s) => s.glass)
  const fill = thick ? Math.max(tint, THICK_TINT) : tint

  if (!enabled || mode === 'solid') {
    return (
      <div
        aria-hidden
        className={cn(tone === 'page' ? 'bg-background' : 'bg-card', className)}
        style={{ ...LAYER_STYLE, borderRadius: radius }}
      />
    )
  }
  const glassColor = `rgba(${TINT_RGB[tone][mode]},${fill})`
  const borderColor = `rgba(255,255,255,${tone === 'page' ? 0 : rim * RIM_SCALE[mode]})`

  return (
    <LiquidGlass
      aria-hidden
      material={material}
      {...optics}
      {...(thick && { blur: Math.max(optics.blur ?? 0, THICK_BLUR) })}
      // Page-toned bars (headers) must match the background exactly: no frost, colour boost, fringing or sheen.
      {...(tone === 'page' && PAGE_OPTICS)}
      radius={radius}
      // Touch: show at once instead of staying transparent up to 400ms while the renderer warms up.
      {...(touch && { reveal: 'immediate' as const })}
      {...(!floating && { backdropSelector: backdrop, backdropVersion: mode })}
      glassColor={glassColor}
      borderColor={borderColor}
      className={cn(soft && 'glass-soft', tone === 'page' && 'glass-bare', className)}
      style={LAYER_STYLE}
    />
  )
}

export { GlassLayer, GlassBackdropContext }
