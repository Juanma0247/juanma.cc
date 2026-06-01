export interface I18n {
  nav: {
    home: string
    projects: string
    tools: string
    scripts: string
    contact: string
    games: string
  }
  sections: {
    tools: string
    games: string
    projects: string
  }
  settings: {
    title: string
    closeLabel: string
    theme: {
      title: string
      desc: string
      system: string
      light: string
      dark: string
      custom: string
      colorPrimary: string
      colorText: string
      colorBg: string
      colorMuted: string
      previewLabel: string
      previewSection: string
      previewBody: string
      previewMuted: string
      presets: {
        grayscale: string
        pastels: string
        warm: string
        vintage: string
        neon: string
      }
      cancel: string
      apply: string
      warnTextBg: string
      warnPrimaryBg: string
      warnTextPrimary: string
    }
    font: {
      title: string
      desc: string
      default: string
    }
    lang: {
      title: string
      desc: string
    }
    page: {
      title: string
      desc: string
      signIn: string
      signOut: string
      signedInAs: string
      unauthorized: string
      defaultLanding: string
      saved: string
      errorSaving: string
    }
  }
  home: {
    tagline: string
    bio: string
    quickProjects: string
    quickGames: string
    quickCodes: string
    skillsTitle: string
    programmingTitle: string
    designTitle: string
    builtTitle: string
    goToSite: string
    builtCard1Title: string
    builtCard1Desc: string
    builtCard2Title: string
    builtCard2Desc: string
  }
  contact: {
    intro: string
  }
  notFound: {
    message: string
    goHome: string
  }
  scripts: {
    intro1: string
    intro2: string
    intro3: string
    copy: string
  }
  tools: {
    minecraft: {
      subtitle: string
      desc: string
      coordsLabel: string
      overworldToNether: string
      netherToOverworld: string
    }
    stringTool: {
      subtitle: string
      sourceString: string
      prefixWhole: string
      suffixWhole: string
      charPrefix: string
      charSuffix: string
      repeat: string
      truncate: string
      splitBy: string
      joinBy: string
      length: string
    }
  }
  games: {
    tictactoe: {
      subtitle: string
      restart: string
    }
    minesweeper: {
      subtitle: string
      height: string
      width: string
      newGame: string
      playerId: string
      load: string
      register: string
      time: string
      percentage: string
      mines: string
      score: string
      name: string
      digitCode: string
    }
    sudoku: {
      subtitle: string
    }
  }
}

export const en: I18n = {
  nav: {
    home: 'Home',
    projects: 'Projects',
    tools: 'Tools',
    scripts: 'Scripts',
    contact: 'Contact',
    games: 'Games',
  },
  sections: {
    tools: 'Tools',
    games: 'Games',
    projects: 'Projects',
  },
  settings: {
    title: 'Settings',
    closeLabel: 'Close settings',
    theme: {
      title: 'Theme',
      desc: 'Choose how the site looks to you.',
      system: 'System',
      light: 'Light',
      dark: 'Dark',
      custom: 'Custom',
      colorPrimary: 'Primary',
      colorText: 'Text',
      colorBg: 'Background',
      colorMuted: 'Muted',
      previewLabel: 'Preview',
      previewSection: 'Section title',
      previewBody: 'Body text content.',
      previewMuted: 'Secondary info.',
      presets: {
        grayscale: 'Grayscale',
        pastels: 'Pastels',
        warm: 'Warm',
        vintage: 'Vintage',
        neon: 'Neon',
      },
      cancel: 'Cancel',
      apply: 'Apply',
      warnTextBg: 'Text may not be readable on the background',
      warnPrimaryBg: 'Primary color may be hard to see',
      warnTextPrimary: 'Text on primary buttons may be hard to read',
    },
    font: {
      title: 'Font',
      desc: 'Choose a global font for the site.',
      default: 'Default',
    },
    lang: {
      title: 'Language',
      desc: 'Switch the interface language.',
    },
    page: {
      title: 'Page Settings',
      desc: 'Customize site behavior. Requires an authorized account.',
      signIn: 'Sign in with Google',
      signOut: 'Sign out',
      signedInAs: 'Signed in as',
      unauthorized: 'This account is not authorized.',
      defaultLanding: 'Default landing page',
      saved: 'Saved!',
      errorSaving: 'Error saving',
    },
  },
  home: {
    tagline: 'Computer Scientist · Math Lover · UX · Tech MC & Sci-Fi',
    bio: "Hi, I'm <strong>Juanma</strong>. I come from Las Mesas, Nariño, and currently live in Manizales, Caldas for my studies. Programming (once committed line by line, now practiced as the distinguished art of vibe coding) has become a way of life for me. I love building all kinds of projects that involve it, and I always will.",
    quickProjects: 'Projects',
    quickGames: 'Games',
    quickCodes: 'Codes',
    skillsTitle: 'Skills',
    programmingTitle: 'Programming',
    designTitle: 'Design',
    builtTitle: "What I've built",
    goToSite: 'Go to site',
    builtCard1Title: 'Icfes para disciplinados',
    builtCard1Desc: 'A platform to share study material for the Colombian Saber 11 exam. Access with document: <strong>0123456789</strong> / password: <strong>ABCD</strong>',
    builtCard2Title: 'Catálogo boutique Arcur',
    builtCard2Desc: 'Product catalog for Colombian clothing brand Arcur, with a hidden admin CRUD system.',
  },
  contact: {
    intro: 'If you want to get in touch with me, feel free to reach out through any of the following channels.',
  },
  notFound: {
    message: 'Page not found :/',
    goHome: 'Go home',
  },
  scripts: {
    intro1: 'If you want, you can access my small Python repository with:',
    intro2: 'To install the file directly you can use:',
    intro3: 'Some algorithms:',
    copy: 'Copy',
  },
  tools: {
    minecraft: {
      subtitle: 'Minecraft Coordinates',
      desc: 'Convert between Overworld and Nether coordinates (× 8 / ÷ 8).',
      coordsLabel: 'Coordinates (space-separated)',
      overworldToNether: 'Overworld → Nether (× 8)',
      netherToOverworld: 'Nether → Overworld (÷ 8)',
    },
    stringTool: {
      subtitle: 'String Tool',
      sourceString: 'Source string',
      prefixWhole: 'Prefix (whole string)',
      suffixWhole: 'Suffix (whole string)',
      charPrefix: 'Char prefix',
      charSuffix: 'Char suffix',
      repeat: 'Repeat ×',
      truncate: 'Truncate ÷',
      splitBy: 'Split by',
      joinBy: 'Join by',
      length: 'Length:',
    },
  },
  games: {
    tictactoe: {
      subtitle: 'Tic-Tac-Toe',
      restart: 'Restart',
    },
    minesweeper: {
      subtitle: 'Minesweeper',
      height: 'Height',
      width: 'Width',
      newGame: 'New Game',
      playerId: 'Player ID',
      load: 'Load',
      register: 'Register',
      time: 'Time: 00s',
      percentage: 'Percentage: 0%',
      mines: 'Mines: 0',
      score: 'Score: 0',
      name: 'Name',
      digitCode: '4-digit code',
    },
    sudoku: {
      subtitle: 'Sudoku',
    },
  },
}
