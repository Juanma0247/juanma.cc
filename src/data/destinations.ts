export interface Destination {
  label: string
  value: string
  group: string
}

export const DESTINATIONS: Destination[] = [
  { label: 'Home',     value: '/',        group: 'Sections' },
  { label: 'Projects', value: '/projects', group: 'Sections' },
  { label: 'Scripts',  value: '/scripts',  group: 'Sections' },
  { label: 'Contact',  value: '/contact',  group: 'Sections' },

  { label: 'Hill Cipher',          value: '/projects/hill-cipher',          group: 'Projects' },
  { label: 'Sets',                 value: '/projects/sets',                 group: 'Projects' },
  { label: 'Cantor Sets',          value: '/projects/cantor-sets',          group: 'Projects' },
  { label: 'Voice',                value: '/projects/voice',                group: 'Projects' },
  { label: 'Fractions',            value: '/projects/fractions',            group: 'Projects' },
  { label: 'Ruffini',              value: '/projects/ruffini',              group: 'Projects' },
  { label: 'Normal Dist.',         value: '/projects/normal-distribution',  group: 'Projects' },
  { label: 'T-Student',            value: '/projects/t-student',            group: 'Projects' },
  { label: 'Chi-Squared',          value: '/projects/chi-squared',          group: 'Projects' },
  { label: 'Bernoulli',            value: '/projects/bernoulli',            group: 'Projects' },
  { label: 'Fractal',              value: '/projects/fractal',              group: 'Projects' },
  { label: 'Sorting',              value: '/projects/sorting',              group: 'Projects' },
  { label: 'Cross Matrix',         value: '/projects/cross-matrix',         group: 'Projects' },
  { label: 'Regular Expressions',  value: '/projects/regular-expressions',  group: 'Projects' },
  { label: 'Σ* Enumeration',       value: '/projects/sigma-star-enum',      group: 'Projects' },
  { label: 'Recursive Concat.',    value: '/projects/recursive-concat',     group: 'Projects' },
  { label: 'Turing Machine',       value: '/projects/turing-machine',       group: 'Projects' },

  { label: 'Tic-Tac-Toe',  value: '/games/tic-tac-toe',  group: 'Games' },
  { label: 'Minesweeper',  value: '/games/minesweeper',  group: 'Games' },
  { label: 'Sudoku',       value: '/games/sudoku',       group: 'Games' },

  { label: 'Minecraft Coords', value: '/tools/minecraft-coords', group: 'Tools' },
  { label: 'String Tool',      value: '/tools/string-tool',      group: 'Tools' },
]
