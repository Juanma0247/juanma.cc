import projects from './projects.json'
import { built } from './built'

export interface Destination {
  label: string
  value: string
  group: string
}

// Main sections. Add a new entry here whenever a new top-level page is created.
const SECTIONS: Destination[] = [
  { label: 'Home',     value: '/',         group: 'Sections' },
  { label: 'Projects', value: '/projects', group: 'Sections' },
  { label: 'Scripts',  value: '/scripts',  group: 'Sections' },
  { label: 'Contact',  value: '/contact',  group: 'Sections' },
  { label: 'Settings', value: '/settings', group: 'Sections' },
]

// Interactive projects — derived from projects.json so new ones appear automatically.
const INTERACTIVE: Destination[] = (
  projects as Array<{ slug: string; navTitle: string; order: number }>
)
  .slice()
  .sort((a, b) => a.order - b.order)
  .map(p => ({ label: p.navTitle, value: `/projects/${p.slug}`, group: 'Projects' }))

// Games and tools now live as part of the Projects section. Add new ones here.
const GAMES: Destination[] = [
  { label: 'Tic-Tac-Toe', value: '/games/tic-tac-toe', group: 'Projects' },
  { label: 'Minesweeper', value: '/games/minesweeper', group: 'Projects' },
  { label: 'Sudoku',      value: '/games/sudoku',      group: 'Projects' },
]

const TOOLS: Destination[] = [
  { label: 'Minecraft Coords', value: '/tools/minecraft-coords', group: 'Projects' },
  { label: 'String Tool',      value: '/tools/string-tool',      group: 'Projects' },
]

// Development projects — derived from built.ts so new ones appear automatically.
const DEVELOPMENT: Destination[] = built.map(b => ({
  label: b.name,
  value: `/projects/built/${b.slug}`,
  group: 'Development',
}))

export const DESTINATIONS: Destination[] = [
  ...SECTIONS,
  ...INTERACTIVE,
  ...GAMES,
  ...TOOLS,
  ...DEVELOPMENT,
]
