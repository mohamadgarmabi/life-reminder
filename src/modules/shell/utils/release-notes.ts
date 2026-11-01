// Conventional-commit prefix ("feat(x): ") is noise for users.
const PREFIX = /^\w+(\([^)]*\))?!?:\s*/
// Git trailers like "Co-Authored-By: Name <mail>" are not release notes.
const TRAILER = /^[\w-]+:\s.*<[^>]+>\s*$/

interface ReleaseNote {
  title: string
  body: string
}

/** Body without trailers, with hard-wrapped continuation lines joined back onto their bullet. */
const cleanBody = (body: string) =>
  body
    .split('\n')
    .filter((line) => !TRAILER.test(line.trim()))
    .reduce<string[]>((lines, line) => {
      if (/^\s+\S/.test(line) && lines.length && lines.at(-1)) lines[lines.length - 1] += ' ' + line.trim()
      else lines.push(line.trim())
      return lines
    }, [])
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

/** Notes for the commits newer than `current` (newest first, de-duplicated by title); last 8 if `current` is unknown. */
const notesSince = (commits: { sha: string; subject: string; body?: string }[], current: string): ReleaseNote[] => {
  const idx = current ? commits.findIndex((c) => c.sha === current) : -1
  const newer = idx === -1 ? commits.slice(0, 8) : commits.slice(0, idx)
  const notes = new Map<string, ReleaseNote>()
  for (const c of newer) {
    const title = c.subject.replace(PREFIX, '').trim()
    if (title && !notes.has(title)) notes.set(title, { title, body: cleanBody(c.body ?? '') })
  }
  return [...notes.values()]
}

export { notesSince }
export type { ReleaseNote }
