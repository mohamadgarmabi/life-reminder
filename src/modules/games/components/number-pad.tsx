import { Eraser } from 'lucide-react'
import { Button } from '#/modules/shell/components/ui/button'
import { toFaDigits } from '#/modules/shell/utils/format'

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const NumberPad = ({
  disabled,
  onInput,
  onErase,
}: {
  disabled: boolean
  onInput: (d: number) => void
  onErase: () => void
}) => {
  return (
    <div dir="ltr" className="grid grid-cols-5 gap-2">
      {DIGITS.map((d) => (
        <Button key={d} variant="secondary" className="h-11 text-lg" disabled={disabled} onClick={() => onInput(d)}>
          {toFaDigits(d)}
        </Button>
      ))}
      <Button variant="outline" className="h-11" disabled={disabled} onClick={onErase} aria-label="پاک کردن">
        <Eraser />
      </Button>
    </div>
  )
}

export { NumberPad }
