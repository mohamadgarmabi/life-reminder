import { describe, expect, it } from 'vitest'
import type { AdventureWorld } from '#/modules/games/adventure/types'
import {
  addItem,
  createSession,
  dispatchPuzzle,
  isObjectiveUnlocked,
  recordSecret,
  summary,
} from '#/modules/games/adventure/utils/session'
import { ISLAND_DATA } from '#/modules/games/adventure/worlds/forgotten-island/content'
import {
  CHIME_SEQUENCE,
  PILLAR_CODE,
  PUZZLES,
  SLUICE_ORDER,
} from '#/modules/games/adventure/worlds/forgotten-island/puzzles'

const world: AdventureWorld = { ...ISLAND_DATA, Scene: () => null }
const none = { has: () => false }
const { pillars, sluices, chimes, altar } = PUZZLES

describe('island puzzles', () => {
  it('pillars solve only at the mural code and ignore bad input', () => {
    let s = pillars.initial
    expect(pillars.isSolved(s)).toBe(false)
    expect(pillars.apply(s, { turn: 7 }, none)).toBe(s)
    expect(pillars.apply(s, undefined as never, none)).toBe(s)
    for (let i = 0; i < 3; i++) while (s.r[i] !== PILLAR_CODE[i]) s = pillars.apply(s, { turn: i }, none)
    expect(pillars.isSolved(s)).toBe(true)
    expect(pillars.isSolved(pillars.apply(s, { turn: 0 }, none))).toBe(false)
  })

  it('sluices open in order; a wrong gate closes them all', () => {
    let s = sluices.apply(sluices.initial, { open: SLUICE_ORDER[0] }, none)
    s = sluices.apply(s, { open: SLUICE_ORDER[1] }, none)
    expect(s.opened).toHaveLength(2)
    const wrong = sluices.apply(s, { open: SLUICE_ORDER[3] }, none)
    expect(wrong.opened).toEqual([])
    expect(sluices.apply(s, { open: 9 }, none)).toEqual(s)
    let ok = sluices.initial
    for (const g of SLUICE_ORDER) ok = sluices.apply(ok, { open: g }, none)
    expect(sluices.isSolved(ok)).toBe(true)
  })

  it('chimes follow the wall sequence; a wrong chime restarts', () => {
    let s = chimes.initial
    s = chimes.apply(s, { ring: CHIME_SEQUENCE[0] }, none)
    s = chimes.apply(s, { ring: CHIME_SEQUENCE[2] }, none)
    expect(s.rung).toEqual([])
    s = chimes.apply(s, { ring: CHIME_SEQUENCE[0] }, none)
    s = chimes.apply(s, { ring: CHIME_SEQUENCE[0] }, none)
    expect(s.rung).toEqual([CHIME_SEQUENCE[0]])
    for (const c of CHIME_SEQUENCE.slice(1)) s = chimes.apply(s, { ring: c }, none)
    expect(chimes.isSolved(s)).toBe(true)
  })

  it('the altar fills slots only for held artifacts', () => {
    const s = altar.apply(altar.initial, 'place', { has: (id) => id === 'tide-shell' })
    expect(s.slots).toEqual([false, true, false])
    expect(altar.isSolved(s)).toBe(false)
    expect(altar.isSolved(altar.apply(s, 'place', { has: () => true }))).toBe(true)
  })

  it('a full playthrough unlocks the beacon with a complete summary', () => {
    let s = createSession(world)
    expect(isObjectiveUnlocked(s, world)).toBe(false)
    const turns = (i: number) => (PILLAR_CODE[i] - pillars.initial.r[i] + 6) % 6
    for (let i = 0; i < 3; i++) for (let n = 0; n < turns(i); n++) s = dispatchPuzzle(s, world, 'pillars', { turn: i })
    for (const g of SLUICE_ORDER) s = dispatchPuzzle(s, world, 'sluices', { open: g })
    for (const c of CHIME_SEQUENCE) s = dispatchPuzzle(s, world, 'chimes', { ring: c })
    expect(s.inventory).toEqual(['sun-disc', 'tide-shell', 'wind-feather'])
    s = dispatchPuzzle(s, world, 'altar', 'place')
    expect(s.inventory).toEqual([])
    expect(isObjectiveUnlocked(s, world)).toBe(true)
    for (let j = 1; j <= 6; j++) s = addItem(s, `journal-${j}`)
    for (const id of Object.keys(world.secrets)) s = recordSecret(s, id)
    expect(summary(s, world)).toMatchObject({ journals: [6, 6], secrets: [3, 3] })
  })

  it('content is complete and consistent', () => {
    expect(world.checkpoints.start).toBeDefined()
    for (const item of Object.values(world.items)) if (item.kind === 'journal') expect(item.text).toBeTruthy()
    for (const p of Object.values(world.puzzles)) expect(p.schema.safeParse(p.initial).success).toBe(true)
    for (const id of world.objective.requires) expect(world.puzzles[id]).toBeDefined()
  })
})
