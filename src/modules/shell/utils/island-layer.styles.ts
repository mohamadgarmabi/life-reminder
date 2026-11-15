import type { CSSProperties } from 'react'

/** Slots start at the stage origin; the frame loop moves them with transforms every frame. */
const islandSlotBase: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  willChange: 'transform, opacity, filter',
  transformOrigin: '50% 50%',
}

/** Sizes an expanded region's content at its own width, up to its column's. */
const islandIntrinsic: CSSProperties = { width: 'max-content', maxWidth: '100%' }

/**
 * Each expanded region moves on its own while the shape morphs. No will-change here: a layer per
 * region would snap to device pixels on top of the slot's own snap and land content a third of a point high.
 */
const islandRegion: CSSProperties = { minWidth: 0, transformOrigin: '50% 50%' }

/** Space between the expanded regions' columns. */
const ISLAND_COLUMN_GAP = 10

export { islandSlotBase, islandIntrinsic, islandRegion, ISLAND_COLUMN_GAP }
