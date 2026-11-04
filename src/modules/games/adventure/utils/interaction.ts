type Point = { x: number; y: number; z: number }
type Target = { id: string; position: Point; radius: number }

const VIEW_CONE = Math.PI / 3 // 60° total, i.e. 30° either side of the view direction

/**
 * Picks what the action button applies to: in reach, inside the horizontal view cone,
 * smallest angle to the view centre wins. Things almost underfoot always count.
 */
const pickTarget = <T extends Target>(targets: Iterable<T>, player: Point, viewDir: { x: number; z: number }) => {
  const len = Math.hypot(viewDir.x, viewDir.z) || 1
  const vx = viewDir.x / len
  const vz = viewDir.z / len
  let best: T | null = null
  let bestAngle = Infinity
  for (const t of targets) {
    const dx = t.position.x - player.x
    const dz = t.position.z - player.z
    const dist = Math.hypot(dx, dz)
    if (dist > t.radius || Math.abs(t.position.y - player.y) > 3) continue
    const angle = dist < 0.6 ? 0 : Math.acos(Math.max(-1, Math.min(1, (dx * vx + dz * vz) / dist)))
    if (angle > VIEW_CONE / 2 + (dist < 1.2 ? Math.PI / 4 : 0)) continue
    if (angle < bestAngle) {
      best = t
      bestAngle = angle
    }
  }
  return best
}

export { pickTarget, VIEW_CONE }
