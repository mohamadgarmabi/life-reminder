interface GlassLayerProps {
  /** Corner radius in px; must match the surface's own rounding. */
  radius: number
  /** Overlay material (sheets, dialogs, menus): minimum tint and blur for legible text. */
  thick?: boolean
  /** A small, soft drop shadow instead of the library's heavy one (floating bars over content). */
  soft?: boolean
  /** 'page': tinted with the page background and no rim, so a bar blends into the page (headers). */
  tone?: 'surface' | 'page'
  className?: string
}

export type { GlassLayerProps }
