import { describe, expect, it } from 'vitest'
import { notesSince } from '#/modules/shell/utils/release-notes'

const commits = [
  { sha: 'c', subject: 'feat(games): add sudoku', body: '' },
  { sha: 'b', subject: 'fix: update date action', body: '' },
  { sha: 'b2', subject: 'fix: update date action', body: '' },
  { sha: 'a', subject: 'refactor!: old', body: '' },
]
const titles = (notes: { title: string }[]) => notes.map((n) => n.title)

describe('notesSince', () => {
  it('lists only commits newer than the running build, without prefixes or duplicates', () => {
    expect(titles(notesSince(commits, 'a'))).toEqual(['add sudoku', 'update date action'])
  })
  it('is empty when already on the newest commit', () => {
    expect(notesSince(commits, 'c')).toEqual([])
  })
  it('falls back to the latest commits when the build sha is unknown', () => {
    expect(titles(notesSince(commits, ''))).toEqual(['add sudoku', 'update date action', 'old'])
  })
  it('keeps the whole body, joining wrapped lines and dropping trailers', () => {
    const body = [
      'Bug fixes',
      '- The bar keeps the correct colours when switching',
      '  between light and dark mode.',
      '',
      'Internal',
      '- Move components.',
      '',
      'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>',
    ].join('\n')
    expect(notesSince([{ sha: 'x', subject: 'fix: nav colour', body }], '')).toEqual([
      {
        title: 'nav colour',
        body: 'Bug fixes\n- The bar keeps the correct colours when switching between light and dark mode.\n\nInternal\n- Move components.',
      },
    ])
  })
})
