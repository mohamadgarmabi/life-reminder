import { Plus, X } from 'lucide-react'
import { FieldDescription, FieldLegend, FieldSet } from '#/components/field'
import { Badge } from '#/components/badge'
import { Button } from '#/components/button'
import { Input } from '#/components/input'
import { useTagInput } from '#/modules/shell/hooks/tag-input.hook'
import { t } from '#/modules/shell/utils/i18n'

type TagInputProps = {
  value: string[]
  onChange: (value: string[]) => void
  knownTags: string[]
  placeholder?: string
}

const TagInput = ({ value, onChange, knownTags, placeholder }: TagInputProps) => {
  const tags = useTagInput({ value, onChange, knownTags })
  return (
    <FieldSet>
      <FieldLegend variant="label">{t('shell.tags.label')}</FieldLegend>
      {tags.selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.selected.map((x) => (
            <Badge key={x.tag} className="gap-1 pe-1">
              {x.tag}
              <button type="button" aria-label={x.removeLabel} onClick={x.onRemove}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={tags.draft}
          placeholder={placeholder}
          aria-label={t('shell.tags.new')}
          onChange={(e) => tags.handleDraftChange(e.target.value)}
          onKeyDown={tags.handleKeyDown}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t('shell.tags.add')}
          disabled={!tags.canAdd}
          onClick={tags.handleAdd}
        >
          <Plus />
        </Button>
      </div>
      {tags.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.suggestions.map((x) => (
            <Button key={x.tag} type="button" size="sm" variant="secondary" className="h-7" onClick={x.onAdd}>
              <Plus className="size-3" /> {x.tag}
            </Button>
          ))}
        </div>
      )}
      <FieldDescription>{t('shell.tags.hint')}</FieldDescription>
    </FieldSet>
  )
}

export { TagInput }
