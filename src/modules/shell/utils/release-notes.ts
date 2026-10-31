// Conventional-commit prefix ("feat(x): ") is noise for users.
const PREFIX = /^\w+(\([^)]*\))?!?:\s*/

/** Subjects of the commits newer than `current` (newest first, de-duplicated); last 8 if `current` is unknown. */
const notesSince = (commits: { sha: string; subject: string }[], current: string) => {
  const idx = current ? commits.findIndex((c) => c.sha === current) : -1
  const newer = idx === -1 ? commits.slice(0, 8) : commits.slice(0, idx)
  return [...new Set(newer.map((c) => c.subject.replace(PREFIX, '').trim()).filter(Boolean))]
}

export { notesSince }
