// Small deterministic terrain toolkit: seeded value noise, fBm and plateau blending.
// Pure functions so a world's height map can be unit-tested for walkability.

const hash = (x: number, z: number, seed: number) => {
  let h = (x * 374761393 + z * 668265263 + seed * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

const smooth = (t: number) => t * t * (3 - 2 * t)

/** Value noise in 0..1. */
const noise2 = (x: number, z: number, seed: number) => {
  const xi = Math.floor(x)
  const zi = Math.floor(z)
  const tx = smooth(x - xi)
  const tz = smooth(z - zi)
  const a = hash(xi, zi, seed)
  const b = hash(xi + 1, zi, seed)
  const c = hash(xi, zi + 1, seed)
  const d = hash(xi + 1, zi + 1, seed)
  return a + (b - a) * tx + (c - a) * tz + (a - b - c + d) * tx * tz
}

/** Fractal noise in roughly −1..1. */
const fbm = (x: number, z: number, seed: number, octaves = 4) => {
  let sum = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    sum += amp * (noise2(x * freq, z * freq, seed + i * 17) * 2 - 1)
    amp *= 0.5
    freq *= 2
  }
  return sum
}

const smoothstep = (a: number, b: number, x: number) => smooth(Math.max(0, Math.min(1, (x - a) / (b - a))))

type Flat = { x: number; z: number; r: number; h: number }

/** Blends a height towards flat plateaus (r = fully flat radius; fades out by 3r). */
const applyFlats = (h: number, x: number, z: number, flats: Flat[]) => {
  for (const f of flats) {
    const t = 1 - smoothstep(f.r, f.r * 3, Math.hypot(x - f.x, z - f.z))
    h += (f.h - h) * t
  }
  return h
}

/** Samples heights on a (segments+1)² grid centred on the origin, row-major by z then x. */
const buildHeightGrid = (size: number, segments: number, height: (x: number, z: number) => number) => {
  const n = segments + 1
  const out = new Float32Array(n * n)
  for (let iz = 0; iz < n; iz++)
    for (let ix = 0; ix < n; ix++) out[iz * n + ix] = height((ix / segments - 0.5) * size, (iz / segments - 0.5) * size)
  return out
}

export { noise2, fbm, smoothstep, applyFlats, buildHeightGrid }
export type { Flat }
