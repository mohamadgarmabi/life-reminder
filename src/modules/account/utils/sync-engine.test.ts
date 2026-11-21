import { describe, expect, it } from 'vitest'
import { chunk, diffChanges } from '#/modules/account/utils/sync-engine'

const rec = (id: string, data: string) => ({ store: 'plants' as const, id, data })

describe('diffChanges', () => {
  it('sends new and changed records, skips unchanged ones, and deletes synced records gone locally', () => {
    const first = diffChanges([rec('a', '{"v":1}'), rec('b', '{"v":1}')], new Map())
    expect(first.map((c) => c.id)).toEqual(['a', 'b'])

    const synced = new Map(first.map((c) => [c.key, c.hash ?? '']))
    synced.set('plans:gone', 'x')
    const next = diffChanges([rec('a', '{"v":1}'), rec('b', '{"v":2}')], synced)
    expect(next.map(({ store, id, data }) => ({ store, id, data }))).toEqual([
      { store: 'plants', id: 'b', data: '{"v":2}' },
      { store: 'plans', id: 'gone', data: null },
    ])
  })

  it('ignores bookkeeping keys of stores that are not synced', () => {
    expect(diffChanges([], new Map([['other:x', 'h']]))).toEqual([])
  })
})

describe('chunk', () => {
  it('splits big uploads so each request stays under the size limit', () => {
    const big = 'x'.repeat(3_000_000)
    const parts = chunk(diffChanges([rec('a', big), rec('b', big), rec('c', '{}')], new Map()))
    expect(parts.map((p) => p.map((c) => c.id))).toEqual([['a'], ['b', 'c']])
  })
})
