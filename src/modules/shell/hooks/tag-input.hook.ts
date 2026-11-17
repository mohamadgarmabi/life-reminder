import { useState, type KeyboardEvent } from 'react'
import { t } from '#/modules/shell/utils/i18n'

type TagInputArgs = { value: string[]; onChange: (value: string[]) => void; knownTags: string[] }

/** Chip-style tag editor state: Enter / comma adds, known tags are offered as suggestions. */
const useTagInput = ({ value, onChange, knownTags }: TagInputArgs) => {
  const [draft, setDraft] = useState('')
  const add = (tag: string) => {
    const clean = tag.trim()
    if (clean && !value.includes(clean)) onChange([...value, clean])
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
    selected: value.map((tag) => ({
      tag,
      removeLabel: t('shell.tags.remove', { tag }),
      onRemove: () => onChange(value.filter((x) => x !== tag)),
    })),
    suggestions: knownTags
      .filter((tag) => !value.includes(tag) && tag.includes(q))
      .map((tag) => ({ tag, onAdd: () => add(tag) })),
  }
}

export { useTagInput }
