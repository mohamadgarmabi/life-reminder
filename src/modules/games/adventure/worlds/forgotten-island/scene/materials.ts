import * as THREE from 'three'

// Shared materials: one GPU program/upload each for the whole island.
const stone = new THREE.MeshStandardMaterial({ color: '#c9b591', roughness: 0.95, flatShading: true })
const darkStone = new THREE.MeshStandardMaterial({ color: '#8d7d66', roughness: 1, flatShading: true })
const mossStone = new THREE.MeshStandardMaterial({ color: '#7f8a5a', roughness: 1, flatShading: true })
const wood = new THREE.MeshStandardMaterial({ color: '#7a5434', roughness: 0.9, flatShading: true })
const oldWood = new THREE.MeshStandardMaterial({ color: '#5b4632', roughness: 1, flatShading: true })
const canvasCloth = new THREE.MeshStandardMaterial({
  color: '#d8c7a3',
  roughness: 1,
  flatShading: true,
  side: THREE.DoubleSide,
})
const metal = new THREE.MeshStandardMaterial({ color: '#7a6a4a', roughness: 0.5, metalness: 0.6 })
const gold = new THREE.MeshStandardMaterial({
  color: '#e8b54a',
  roughness: 0.35,
  metalness: 0.8,
  emissive: '#6b4300',
  emissiveIntensity: 0.3,
})
const shell = new THREE.MeshStandardMaterial({
  color: '#cfe8ef',
  roughness: 0.2,
  metalness: 0.3,
  emissive: '#1e5a6a',
  emissiveIntensity: 0.4,
})
const feather = new THREE.MeshStandardMaterial({
  color: '#f5f5ef',
  roughness: 0.6,
  emissive: '#7a8aa0',
  emissiveIntensity: 0.25,
  side: THREE.DoubleSide,
})
const water = new THREE.MeshStandardMaterial({
  color: '#2e8f8a',
  roughness: 0.15,
  metalness: 0.1,
  transparent: true,
  opacity: 0.75,
})
const ember = new THREE.MeshBasicMaterial({ color: '#ffb347', toneMapped: false })

type GlyphName = 'sun' | 'moon' | 'wave' | 'star' | 'leaf' | 'fish'
/** Same order as GLYPH_NAMES in puzzles.ts. */
const GLYPHS: GlyphName[] = ['sun', 'moon', 'wave', 'star', 'leaf', 'fish']

const drawGlyph = (ctx: CanvasRenderingContext2D, glyph: GlyphName, cx: number, cy: number, r: number) => {
  ctx.beginPath()
  switch (glyph) {
    case 'sun':
      ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        ctx.moveTo(cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6)
        ctx.lineTo(cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9)
      }
      break
    case 'moon':
      ctx.arc(cx, cy, r * 0.75, Math.PI * 0.3, Math.PI * 1.7)
      ctx.arc(cx + r * 0.35, cy, r * 0.55, Math.PI * 1.55, Math.PI * 0.45, true)
      break
    case 'wave':
      for (let row = -1; row <= 1; row++) {
        ctx.moveTo(cx - r * 0.85, cy + row * r * 0.45)
        for (let x = -0.85; x <= 0.85; x += 0.05)
          ctx.lineTo(cx + x * r, cy + row * r * 0.45 + Math.sin(x * 7) * r * 0.14)
      }
      break
    case 'star':
      for (let i = 0; i <= 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2
        const rr = i % 2 ? r * 0.38 : r * 0.88
        if (i) ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
        else ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
      }
      break
    case 'leaf':
      ctx.moveTo(cx, cy + r * 0.9)
      ctx.quadraticCurveTo(cx + r * 0.9, cy, cx, cy - r * 0.9)
      ctx.quadraticCurveTo(cx - r * 0.9, cy, cx, cy + r * 0.9)
      ctx.moveTo(cx, cy + r * 0.9)
      ctx.lineTo(cx, cy - r * 0.6)
      break
    case 'fish':
      ctx.ellipse(cx - r * 0.1, cy, r * 0.6, r * 0.35, 0, 0, Math.PI * 2)
      ctx.moveTo(cx + r * 0.5, cy)
      ctx.lineTo(cx + r * 0.9, cy - r * 0.35)
      ctx.lineTo(cx + r * 0.9, cy + r * 0.35)
      ctx.closePath()
      break
  }
  ctx.stroke()
}

const canvasTexture = (w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  paint(ctx)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** Carved glyphs in a row on weathered stone (cells left → right). */
const glyphStrip = (glyphs: GlyphName[], cell = 128, base = '#b9a37c', ink = '#4a3a26') =>
  canvasTexture(cell * glyphs.length, cell, (ctx) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, cell * glyphs.length, cell)
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(60,40,20,${Math.random() * 0.08})`
      ctx.fillRect(Math.random() * cell * glyphs.length, Math.random() * cell, 3, 3)
    }
    ctx.strokeStyle = ink
    ctx.lineWidth = cell * 0.07
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    glyphs.forEach((g, i) => drawGlyph(ctx, g, cell * i + cell / 2, cell / 2, cell * 0.36))
  })

/** A single glowing glyph (for lit wall marks). */
const glyphGlow = (glyph: GlyphName) =>
  canvasTexture(128, 128, (ctx) => {
    ctx.clearRect(0, 0, 128, 128)
    ctx.strokeStyle = '#fff2c4'
    ctx.shadowColor = '#ffd36b'
    ctx.shadowBlur = 16
    ctx.lineWidth = 9
    ctx.lineCap = 'round'
    drawGlyph(ctx, glyph, 64, 64, 46)
  })

const ALL_MATERIALS = [
  stone,
  darkStone,
  mossStone,
  wood,
  oldWood,
  canvasCloth,
  metal,
  gold,
  shell,
  feather,
  water,
  ember,
]

export {
  stone,
  darkStone,
  mossStone,
  wood,
  oldWood,
  canvasCloth,
  metal,
  gold,
  shell,
  feather,
  water,
  ember,
  GLYPHS,
  glyphStrip,
  glyphGlow,
  canvasTexture,
  ALL_MATERIALS,
}
export type { GlyphName }
