import type { GameCategory, GameEntry } from '#/modules/games/types'
import type { MessageKey } from '#/modules/shell/utils/i18n'

const GAME_CATEGORIES: { value: GameCategory | 'all'; label: MessageKey }[] = [
  { value: 'all', label: 'games.category.all' },
  { value: 'arcade', label: 'games.category.arcade' },
  { value: '3d', label: 'games.category.3d' },
  { value: 'puzzle', label: 'games.category.puzzle' },
  { value: 'board', label: 'games.category.board' },
]

const GAMES: GameEntry[] = [
  {
    id: 'island',
    title: 'games.island.title',
    description: 'games.island.description',
    category: '3d',
    emoji: '🏝️',
    tint: 'bg-teal-500/15',
  },
  ...(import.meta.env.DEV
    ? [
        {
          id: 'test-room',
          title: 'games.testRoom.title' as const,
          description: 'games.testRoom.description' as const,
          category: '3d' as const,
          emoji: '🧪',
          tint: 'bg-zinc-500/15',
        },
      ]
    : []),
  {
    id: 'runner',
    title: 'games.runner.title',
    description: 'games.runner.description',
    category: '3d',
    emoji: '🏃',
    tint: 'bg-indigo-500/15',
  },
  {
    id: 'traffic',
    title: 'games.traffic.title',
    description: 'games.traffic.description',
    category: '3d',
    emoji: '🚗',
    tint: 'bg-red-500/15',
  },
  {
    id: 'snake',
    title: 'games.snake.title',
    description: 'games.snake.description',
    category: 'arcade',
    emoji: '🐍',
    tint: 'bg-green-500/15',
  },
  {
    id: 'blocks',
    title: 'games.blocks.title',
    description: 'games.blocks.description',
    category: 'arcade',
    emoji: '🧱',
    tint: 'bg-violet-500/15',
  },
  {
    id: 'breakout',
    title: 'games.breakout.title',
    description: 'games.breakout.description',
    category: 'arcade',
    emoji: '🏓',
    tint: 'bg-orange-500/15',
  },
  {
    id: 'firefly',
    title: 'games.firefly.title',
    description: 'games.firefly.description',
    category: 'arcade',
    emoji: '✨',
    tint: 'bg-yellow-400/20',
  },
  {
    id: 'meteor',
    title: 'games.meteor.title',
    description: 'games.meteor.description',
    category: 'arcade',
    emoji: '🚀',
    tint: 'bg-sky-500/15',
  },
  {
    id: 'match3',
    title: 'games.match3.title',
    description: 'games.match3.description',
    category: 'puzzle',
    emoji: '💎',
    tint: 'bg-pink-500/15',
  },
  {
    id: 'merge',
    title: 'games.merge.title',
    description: 'games.merge.description',
    category: 'puzzle',
    emoji: '🔢',
    tint: 'bg-amber-500/15',
  },
  {
    id: 'sudoku',
    title: 'games.sudoku.title',
    description: 'games.sudoku.description',
    category: 'puzzle',
    emoji: '9️⃣',
    tint: 'bg-blue-500/15',
  },
  {
    id: 'mines',
    title: 'games.mines.title',
    description: 'games.mines.description',
    category: 'puzzle',
    emoji: '💣',
    tint: 'bg-red-500/15',
  },
  {
    id: 'memory',
    title: 'games.memory.title',
    description: 'games.memory.description',
    category: 'puzzle',
    emoji: '🃏',
    tint: 'bg-teal-500/15',
  },
  {
    id: 'water',
    title: 'games.water.title',
    description: 'games.water.description',
    category: 'puzzle',
    emoji: '🧪',
    tint: 'bg-cyan-500/15',
  },
  {
    id: 'connect4',
    title: 'games.connect4.title',
    description: 'games.connect4.description',
    category: 'board',
    emoji: '🔴',
    tint: 'bg-rose-500/15',
  },
]

export { GAMES, GAME_CATEGORIES }
