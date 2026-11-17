import type { AdventureWorld, Checkpoint } from '#/modules/games/adventure/types'
import { KILL_Y, site, type Site } from '#/modules/games/adventure/worlds/forgotten-island/layout'
import { PUZZLES } from '#/modules/games/adventure/worlds/forgotten-island/puzzles'

const checkpoint = (id: Site, yaw: number, dx = 0, dz = 0): Checkpoint => ({ id, position: site(id, dx, dz, 1.2), yaw })

/** Everything about the island except its 3D scene, so rules and content are testable without WebGL. */
const ISLAND_DATA: Omit<AdventureWorld, 'Scene'> = {
  id: 'island',
  title: 'adventure.island.title',
  description: 'adventure.island.description',
  items: {
    'sun-disc': {
      id: 'sun-disc',
      kind: 'artifact',
      name: 'adventure.island.sunDisc.name',
      description: 'adventure.island.sunDisc.description',
      icon: '🌞',
    },
    'tide-shell': {
      id: 'tide-shell',
      kind: 'artifact',
      name: 'adventure.island.tideShell.name',
      description: 'adventure.island.tideShell.description',
      icon: '🐚',
    },
    'wind-feather': {
      id: 'wind-feather',
      kind: 'artifact',
      name: 'adventure.island.windFeather.name',
      description: 'adventure.island.windFeather.description',
      icon: '🪶',
    },
    'journal-1': {
      id: 'journal-1',
      kind: 'journal',
      name: 'adventure.island.journal1.name',
      description: 'adventure.island.journal1.description',
      icon: '📜',
      text: 'adventure.island.journal1.text',
    },
    'journal-2': {
      id: 'journal-2',
      kind: 'journal',
      name: 'adventure.island.journal2.name',
      description: 'adventure.island.journal2.description',
      icon: '📜',
      text: 'adventure.island.journal2.text',
    },
    'journal-3': {
      id: 'journal-3',
      kind: 'journal',
      name: 'adventure.island.journal3.name',
      description: 'adventure.island.journal3.description',
      icon: '📜',
      text: 'adventure.island.journal3.text',
    },
    'journal-4': {
      id: 'journal-4',
      kind: 'journal',
      name: 'adventure.island.journal4.name',
      description: 'adventure.island.journal4.description',
      icon: '📜',
      text: 'adventure.island.journal4.text',
    },
    'journal-5': {
      id: 'journal-5',
      kind: 'journal',
      name: 'adventure.island.journal5.name',
      description: 'adventure.island.journal5.description',
      icon: '📜',
      text: 'adventure.island.journal5.text',
    },
    'journal-6': {
      id: 'journal-6',
      kind: 'journal',
      name: 'adventure.island.journal6.name',
      description: 'adventure.island.journal6.description',
      icon: '📜',
      text: 'adventure.island.journal6.text',
    },
  },
  puzzles: PUZZLES,
  checkpoints: {
    start: checkpoint('start', 0),
    shrine: checkpoint('shrine', -0.6, 6, 8),
    ruins: checkpoint('ruins', 1.2, -14, 6),
    cliff: checkpoint('cliff', -1.4, 8, 10),
    temple: checkpoint('temple', 0, 0, 12),
    summit: checkpoint('summit', 0, 0, 4),
  },
  secrets: {
    'waterfall-passage': { id: 'waterfall-passage', kind: 'passage' },
    'cliff-shortcut': { id: 'cliff-shortcut', kind: 'passage' },
    'buried-cellar': { id: 'buried-cellar', kind: 'discovery' },
  },
  objective: { requires: ['altar'], trigger: 'reach' },
  killY: KILL_Y,
  hints: {
    start: 'adventure.island.hint.start',
    shrine: 'adventure.island.hint.shrine',
    forest: 'adventure.island.hint.forest',
    ruins: 'adventure.island.hint.ruins',
    cliff: 'adventure.island.hint.cliff',
    temple: 'adventure.island.hint.temple',
    summit: 'adventure.island.hint.summit',
  },
}

export { ISLAND_DATA }
