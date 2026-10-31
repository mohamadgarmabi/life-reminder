import { createFileRoute } from '@tanstack/react-router'
import SudokuView from '#/modules/games/views/sudoku-view'

const SudokuRoute = () => <SudokuView />

export const Route = createFileRoute('/games/sudoku')({
  component: SudokuRoute,
})
