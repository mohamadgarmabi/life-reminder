import type { SudokuBoardProps } from '#/modules/games/types'
import { isPeer } from '#/modules/games/utils/sudoku'
import { cn } from '#/modules/shell/utils/cn'
import { toFaDigits } from '#/modules/shell/utils/format'

const useSudokuBoard = ({ board, givens, solution, selected }: SudokuBoardProps) => {
  const selectedDigit = selected === null ? 0 : board[selected]

  const cells = board.map((value, i) => {
    const r = Math.floor(i / 9)
    const c = i % 9
    const given = givens[i] !== 0
    const wrong = !given && value !== 0 && value !== solution[i]
    return {
      index: i,
      label: value ? toFaDigits(value) : '',
      ariaLabel: `سطر ${toFaDigits(r + 1)}، ستون ${toFaDigits(c + 1)}${value ? `: ${toFaDigits(value)}` : ''}`,
      className: cn(
        'flex aspect-square items-center justify-center border-foreground/10 text-[clamp(0.8rem,4cqw,1.5rem)] transition-colors outline-none',
        c < 8 && 'border-e',
        r < 8 && 'border-b',
        c % 3 === 2 && c < 8 && 'border-e-2 border-e-foreground/40',
        r % 3 === 2 && r < 8 && 'border-b-2 border-b-foreground/40',
        given ? 'font-bold text-foreground' : 'text-primary',
        selected !== null && isPeer(selected, i) && 'bg-accent',
        selectedDigit !== 0 && value === selectedDigit && 'bg-primary/20',
        selected === i && 'bg-primary/35',
        wrong && 'bg-destructive/15 text-destructive',
      ),
    }
  })

  return { cells }
}

export { useSudokuBoard }
