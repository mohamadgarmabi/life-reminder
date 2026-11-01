import type { Match3BoardProps } from '#/modules/games/types'
import { useMatch3Board } from '#/modules/games/hooks/match3-board.hook'

const Match3Board = (props: Match3BoardProps) => {
  const { tiles, handlePointerDown, handlePointerMove, handlePointerEnd, handleTileClick } = useMatch3Board(props)

  return (
    <div
      dir="ltr"
      role="grid"
      aria-label="صفحهٔ بازی"
      aria-busy={props.busy}
      className="@container relative aspect-square w-full touch-none overflow-hidden rounded-2xl glass select-none contain-layout contain-paint"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {tiles.map((tile) => (
        <button
          key={tile.id}
          type="button"
          role="gridcell"
          aria-label={tile.label}
          aria-selected={props.selected === tile.index}
          className="absolute top-0 left-0 size-[12.5%] p-[0.4%] transition-transform duration-200 ease-out will-change-transform outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring"
          style={tile.style}
          onClick={() => handleTileClick(tile.index)}
        >
          <span className={tile.innerClassName} aria-hidden>
            {tile.emoji}
          </span>
        </button>
      ))}
    </div>
  )
}

export { Match3Board }
