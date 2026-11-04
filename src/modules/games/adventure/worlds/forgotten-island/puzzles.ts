import { z } from 'zod'
import type { PuzzleDef } from '#/modules/games/adventure/types'

// Glyph indices used by pillars, sluice plates and chime marks (drawn in scene/glyphs.ts).
const GLYPH_NAMES = ['خورشید', 'ماه', 'موج', 'ستاره', 'برگ', 'ماهی'] as const

/** Shore shrine: the mural shows these glyphs, left to right. */
const PILLAR_CODE = [0, 3, 2]
/** Flooded ruins: gate order hinted in journal 3 (gate index = position left → right). */
const SLUICE_ORDER = [2, 0, 3, 1]
/** Cliff temple: wall glyph sequence (chime index left → right). */
const CHIME_SEQUENCE = [3, 0, 4, 1, 2]
const ARTIFACTS = ['sun-disc', 'tide-shell', 'wind-feather'] as const

const pillars: PuzzleDef<{ r: number[] }, { turn: number }> = {
  id: 'pillars',
  schema: z.object({ r: z.array(z.number().int().min(0).max(5)).length(3) }),
  initial: { r: [1, 5, 4] },
  apply: (s, a) => {
    if (!Number.isInteger(a?.turn) || a.turn < 0 || a.turn > 2) return s
    return { r: s.r.map((v, i) => (i === a.turn ? (v + 1) % 6 : v)) }
  },
  isSolved: (s) => s.r.every((v, i) => v === PILLAR_CODE[i]),
  reward: { give: ['sun-disc'] },
}

/** Ordered-sequence rule shared by the sluices and the chimes: a wrong step resets. */
const sequence = (order: number[], max: number) => (done: number[], step: number) => {
  if (!Number.isInteger(step) || step < 0 || step > max) return done
  if (order[done.length] === step) return [...done, step]
  return step === order[0] ? [step] : []
}

const nextSluice = sequence(SLUICE_ORDER, 3)
const sluices: PuzzleDef<{ opened: number[] }, { open: number }> = {
  id: 'sluices',
  schema: z.object({ opened: z.array(z.number().int().min(0).max(3)).max(4) }),
  initial: { opened: [] },
  apply: (s, a) => (s.opened.includes(a?.open) ? s : { opened: nextSluice(s.opened, a?.open) }),
  isSolved: (s) => s.opened.length === SLUICE_ORDER.length,
  reward: { give: ['tide-shell'] },
}

const nextChime = sequence(CHIME_SEQUENCE, 4)
const chimes: PuzzleDef<{ rung: number[] }, { ring: number }> = {
  id: 'chimes',
  schema: z.object({ rung: z.array(z.number().int().min(0).max(4)).max(5) }),
  initial: { rung: [] },
  apply: (s, a) => ({ rung: nextChime(s.rung, a?.ring) }),
  isSolved: (s) => s.rung.length === CHIME_SEQUENCE.length,
  reward: { give: ['wind-feather'] },
}

/** Central altar: one tap places every artifact the player holds. */
const altar: PuzzleDef<{ slots: boolean[] }, 'place'> = {
  id: 'altar',
  schema: z.object({ slots: z.array(z.boolean()).length(3) }),
  initial: { slots: [false, false, false] },
  apply: (s, _a, ctx) => ({ slots: s.slots.map((filled, i) => filled || ctx.has(ARTIFACTS[i])) }),
  isSolved: (s) => s.slots.every(Boolean),
  reward: { take: [...ARTIFACTS] },
}

const PUZZLES = { pillars, sluices, chimes, altar }

export { GLYPH_NAMES, PILLAR_CODE, SLUICE_ORDER, CHIME_SEQUENCE, ARTIFACTS, PUZZLES }
