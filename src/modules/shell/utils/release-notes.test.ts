import { describe, expect, it } from 'vitest'
import { notesSince } from '#/modules/shell/utils/release-notes'

const commits = [
  { sha: 'c', subject: 'feat(games): add sudoku' },
  { sha: 'b', subject: 'fix: update date action' },
  { sha: 'b2', subject: 'fix: update date action' },
  { sha: 'a', subject: 'refactor!: old' },
]

describe('notesSince', () => {
  it('lists only commits newer than the running build, without prefixes or duplicates', () => {
    expect(notesSince(commits, 'a')).toEqual(['add sudoku', 'update date action'])
  })
  it('is empty when already on the newest commit', () => {
    expect(notesSince(commits, 'c')).toEqual([])
  })
  it('falls back to the latest commits when the build sha is unknown', () => {
    expect(notesSince(commits, '')).toEqual(['add sudoku', 'update date action', 'old'])
  })
})
