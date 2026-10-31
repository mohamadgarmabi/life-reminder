import { ChevronLeft, ChevronRight, PartyPopper, RotateCcw } from 'lucide-react'
import { BackButton } from '#/modules/games/components/back-button'
import { NumberPad } from '#/modules/games/components/number-pad'
import { SudokuBoard } from '#/modules/games/components/sudoku-board'
import { useSudoku } from '#/modules/games/hooks/sudoku.hook'
import { PageHeader } from '#/modules/shell/components/states'
import { Button } from '#/components/button'

const SudokuView = () => {
  const {
    difficulties,
    difficulty,
    board,
    givens,
    solution,
    selected,
    isSolved,
    levelLabel,
    hasPrev,
    hasNext,
    canGoNext,
    handleSelect,
    handleInput,
    handleErase,
    handleReset,
    handleDifficulty,
    handlePrev,
    handleNext,
  } = useSudoku()

  return (
    <>
      <PageHeader title="سودوکو" action={<BackButton to="/games" label="بازی‌ها" />} />
      <div className="flex flex-col items-center gap-4 landscape:flex-row landscape:items-start">
        {/* Board must fit the viewport height (header + tab bar + paddings ≈ 13rem in landscape). */}
        <div className="w-[min(100%,calc(100dvh-20rem))] min-w-56 shrink-0 landscape:w-[min(55%,calc(100dvh-12rem))] landscape:min-w-44">
          <SudokuBoard board={board} givens={givens} solution={solution} selected={selected} onSelect={handleSelect} />
        </div>

        <div className="w-full min-w-0 space-y-3">
          <div className="grid grid-cols-3 gap-1 rounded-full glass p-1" role="group" aria-label="سطح دشواری">
            {difficulties.map((d) => (
              <Button
                key={d.value}
                size="sm"
                variant={d.value === difficulty ? 'default' : 'ghost'}
                aria-pressed={d.value === difficulty}
                onClick={() => handleDifficulty(d.value)}
              >
                {d.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" disabled={!hasPrev} onClick={handlePrev} aria-label="مرحلهٔ قبل">
              <ChevronRight />
            </Button>
            <span className="text-sm font-medium">{levelLabel}</span>
            <Button variant="ghost" size="icon" disabled={!hasNext} onClick={handleNext} aria-label="مرحلهٔ بعد">
              <ChevronLeft />
            </Button>
          </div>

          {isSolved ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl glass p-4 text-center" role="status">
              <PartyPopper className="size-6" aria-hidden />
              <p className="font-semibold">آفرین! این مرحله را حل کردی.</p>
              {canGoNext && <Button onClick={handleNext}>مرحله بعد</Button>}
            </div>
          ) : (
            <NumberPad
              disabled={selected === null || givens[selected] !== 0}
              onInput={handleInput}
              onErase={handleErase}
            />
          )}

          <Button variant="outline" className="w-full" onClick={handleReset}>
            <RotateCcw /> ریست
          </Button>
        </div>
      </div>
    </>
  )
}

export default SudokuView
