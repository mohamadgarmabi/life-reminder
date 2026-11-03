import { describe, expect, it } from 'vitest'
import type { WidgetConfig } from '#/modules/dashboard/types'
import { moveWidget, toggleWidgetSize, withAllWidgets } from '#/modules/dashboard/utils/widgets'

const list: WidgetConfig[] = [
  { id: 'date', size: 'small' },
  { id: 'quick', size: 'large' },
  { id: 'today', size: 'small' },
]
const ids = (l: WidgetConfig[]) => l.map((w) => w.id)

describe('widgets', () => {
  it('moves a widget forward and backward', () => {
    expect(ids(moveWidget(list, 'date', 'today'))).toEqual(['quick', 'today', 'date'])
    expect(ids(moveWidget(list, 'today', 'date'))).toEqual(['today', 'date', 'quick'])
    expect(moveWidget(list, 'date', 'date')).toBe(list)
  })

  it('cycles only the chosen widget through mini, small and large', () => {
    expect(toggleWidgetSize(list, 'date').map((w) => w.size)).toEqual(['large', 'large', 'small'])
    expect(toggleWidgetSize(list, 'quick')[1].size).toBe('mini')
    expect(toggleWidgetSize(toggleWidgetSize(list, 'quick'), 'quick')[1].size).toBe('small')
  })

  it('appends widgets missing from an older saved layout', () => {
    const all = withAllWidgets(list)
    expect(ids(all).slice(0, 3)).toEqual(['date', 'quick', 'today'])
    expect(ids(all)).toEqual(expect.arrayContaining(['overdue', 'upcoming']))
    expect(new Set(ids(all)).size).toBe(all.length)
  })
})
