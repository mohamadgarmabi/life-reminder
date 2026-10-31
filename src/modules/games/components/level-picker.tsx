import { Lock } from 'lucide-react'
import type { Match3LevelItem } from '#/modules/games/types'
import { Button } from '#/components/button'

const LevelPicker = ({ levels, onPick }: { levels: Match3LevelItem[]; onPick: (level: number) => void }) => {
  return (
    <div className="grid grid-cols-5 gap-2 landscape:grid-cols-10">
      {levels.map((item) => (
        <Button
          key={item.level}
          variant={item.variant}
          className="h-12 flex-col gap-0 rounded-xl"
          disabled={item.locked}
          onClick={() => onPick(item.level)}
          aria-label={item.ariaLabel}
        >
          {item.locked ? <Lock className="size-3.5" aria-hidden /> : item.label}
          {item.bestLabel && <span className="text-[10px] text-muted-foreground">{item.bestLabel}</span>}
        </Button>
      ))}
    </div>
  )
}

export { LevelPicker }
