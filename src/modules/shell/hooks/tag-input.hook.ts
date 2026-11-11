import { useState, type KeyboardEvent } from 'react'

type TagInputArgs = { value: string[]; onChange: (value: string[]) => void; knownTags: string[] }

/** Chip-style tag editor state: Enter / comma adds, known tags are offered as suggestions. */
const useTagInput = ({ value, onChange, knownTags }: TagInputArgs) => {
  const [draft, setDraft] = useState('')
  const add = (tag: string) => {
    const t = tag.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setDraft('')
  }
  const q = draft.trim()
  return {
    draft,
    handleDraftChange: setDraft,
    handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter' && e.key !== ',' && e.key !== '،') return
      e.preventDefault()
      add(draft)
    },
    handleAdd: () => add(draft),
    canAdd: q.length > 0 && !value.includes(q),
    selected: value.map((t) => ({ tag: t, onRemove: () => onChange(value.filter((x) => x !== t)) })),
    suggestions: knownTags
      .filter((t) => !value.includes(t) && t.includes(q))
      .map((t) => ({ tag: t, onAdd: () => add(t) })),
  }
}

export { useTagInput }
