import type { SudokuBoardProps } from '#/modules/games/types'
import { useSudokuBoard } from '#/modules/games/hooks/sudoku-board.hook'
import { t } from '#/modules/shell/utils/i18n'

const SudokuBoard = (props: SudokuBoardProps) => {
  const { cells } = useSudokuBoard(props)

  return (
    <div
      dir="ltr"
      role="grid"
      aria-label={t('games.sudoku.grid')}
      className="@container grid aspect-square w-full grid-cols-9 overflow-hidden rounded-xl border-2 border-foreground/40 surface"
    >
      {cells.map((cell) => (
        <button
          key={cell.index}
          type="button"
          role="gridcell"
          aria-label={cell.ariaLabel}
          aria-selected={props.selected === cell.index}
          className={cell.className}
          onClick={() => props.onSelect(cell.index)}
        >
          {cell.label}
        </button>
      ))}
    </div>
  )
}

export { SudokuBoard }
