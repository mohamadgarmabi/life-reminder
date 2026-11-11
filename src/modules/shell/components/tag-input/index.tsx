import { Plus, X } from 'lucide-react'
import { FieldDescription, FieldLegend, FieldSet } from '#/components/field'
import { Badge } from '#/components/badge'
import { Button } from '#/components/button'
import { Input } from '#/components/input'
import { useTagInput } from '#/modules/shell/hooks/tag-input.hook'

type TagInputProps = {
  value: string[]
  onChange: (value: string[]) => void
  knownTags: string[]
  placeholder?: string
}

const TagInput = ({ value, onChange, knownTags, placeholder }: TagInputProps) => {
  const t = useTagInput({ value, onChange, knownTags })
  return (
    <FieldSet>
      <FieldLegend variant="label">تگ‌ها</FieldLegend>
      {t.selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {t.selected.map((x) => (
            <Badge key={x.tag} className="gap-1 pe-1">
              {x.tag}
              <button type="button" aria-label={`حذف تگ ${x.tag}`} onClick={x.onRemove}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={t.draft}
          placeholder={placeholder}
          aria-label="تگ جدید"
          onChange={(e) => t.handleDraftChange(e.target.value)}
          onKeyDown={t.handleKeyDown}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="افزودن تگ"
          disabled={!t.canAdd}
          onClick={t.handleAdd}
        >
          <Plus />
        </Button>
      </div>
      {t.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {t.suggestions.map((x) => (
            <Button key={x.tag} type="button" size="sm" variant="secondary" className="h-7" onClick={x.onAdd}>
              <Plus className="size-3" /> {x.tag}
            </Button>
          ))}
        </div>
      )}
      <FieldDescription>با Enter اضافه کنید یا از تگ‌های قبلی انتخاب کنید.</FieldDescription>
    </FieldSet>
  )
}

export { TagInput }
